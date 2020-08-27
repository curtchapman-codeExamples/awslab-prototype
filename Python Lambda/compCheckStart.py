import sys
import random
import string
import hashlib
import json
import boto3
import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId
from io import StringIO


def startInstance():
            #Start Instance
            ecsClient = boto3.client('ecs')
            startResponse = ecsClient.run_task(
                cluster='CompCheckCluster',
                launchType='FARGATE',
                taskDefinition='LFIv1:3',
                count = 1,
                platformVersion='LATEST',
                networkConfiguration={
                    'awsvpcConfiguration': {
                    'subnets': [
                        'subnet-0a9172b63f95bb4e3',
                    ],
                    'securityGroups': [
                        'sg-0293c7f6b65b8200b'
                    ],
                    'assignPublicIp': 'ENABLED'
                    }
            })

            return startResponse

def doesFlagExist(chunkArray, obID):
    #establish DB connection
    client = MongoClient('REMOVED FOR CODE EXAMPLE UPLOAD')

    with client:

        chunkInt = int(chunkArray)
        db = client['imp-ccdb']
        dbComm = db['commissions']

        nullCheck = dbComm.find_one({'_id': ObjectId(obID)},
                            {'commissions': 1, "_id": 0})

        nullCheck = nullCheck['commissions'][chunkInt]['flag']

    return nullCheck

def s3FileCheck(bucketName, s3Path):
    s3 = boto3.resource('s3')
    bucket = s3.Bucket(bucketName)
    s3ExistingCheck = list(bucket.objects.filter(Prefix=s3Path))

    if len(s3ExistingCheck) > 0 and s3ExistingCheck[0].key == s3Path:
        doesExist = "fileExists"
    else:
        doesExist = "doesntExist"
    return doesExist

def updateFlagInDB(flag, chunkArray, obID):
    chunkString = str(chunkArray)
    #establish DB connection
    client = MongoClient('REMOVED FOR CODE EXAMPLE UPLOAD')
    with client:
        db = client['imp-ccdb']
        dbComm = db['commissions']
        dbFlag = "commissions." + chunkString + ".flag"
        dbComm.update_one(
            { '_id': ObjectId(obID) },
            { '$set':
                {
                    dbFlag : flag
                }
            }
        )

def updateTaskArnDB(taskArnNumber, chunkArray, obID):
    chunkString = str(chunkArray)
    #establish DB connection
    client = MongoClient('REMOVED FOR CODE EXAMPLE UPLOAD')
    with client:
        db = client['imp-ccdb']
        dbComm = db['commissions']
        dbTask = "commissions." + chunkString + ".taskArnNumber"
        dbComm.update_one(
            { '_id': ObjectId(obID) },
            { '$set':
                {
                    dbTask : taskArnNumber
                }
            }
        )

def edgeCaseCheck(bucketName, s3Path, flagExists):
    #check if file exists
    checkForFile = s3FileCheck(bucketName, s3Path)
    if (checkForFile == "fileExists"):
        #check for matching keys
        s3 = boto3.resource('s3')
        obj = s3.Object(bucketName, s3Path)
        bodyFlag = obj.get()['Body'].read().decode('utf-8')
        #if they match start the instance
        if (bodyFlag == flagExists):
            startedInstance = startInstance()
            taskArnNumber = startedInstance['tasks'][0]['containers'][0]['taskArn']
    else:
        s3 = boto3.resource('s3')
        bucket = s3.Bucket(bucketName)
        s3.Bucket(bucketName).put_object(Key=s3Path, Body=flagExists)
        obj = s3.Object(bucketName, s3Path)
        bodyFlag = obj.get()['Body'].read().decode('utf-8')
        #if they match start the instance
        if (bodyFlag == flagExists):
            startedInstance = startInstance()
            taskArnNumber = startedInstance['tasks'][0]['containers'][0]['taskArn']
    return str(taskArnNumber)


def lambda_handler(event, context):

    # get code from payload
    courseID = event['body']['courseID']
    obID = event['body']['obID']
    chunkArray = event['body']['chunkArray']
    instanceStopStart = event['body']['instance']
    companyName = event['body']['companyName']

    #set global vars
    bucketName = "compcheckflags"
    s3Path = "flags/" + companyName + "/" + courseID + "-" + obID + "-" + "flag.txt"

    # gen flag with random hash
    flag = hashlib.sha1(str(random.getrandbits(256)).encode('utf-8')).hexdigest()
    #check if we are starting or stopping the instance or if its completed
    if (instanceStopStart == "start"):
        #check if flag exists in database
        flagExists = doesFlagExist(chunkArray, obID)
        if flagExists:
            taskArnUpdate = edgeCaseCheck(bucketName, s3Path, flagExists)
            updateTaskArnDB(taskArnUpdate, chunkArray, obID)
        else:
            #CREATE FOLDER?!
            updateFlagInDB(flag, chunkArray, obID)
            taskArnUpdate = edgeCaseCheck(bucketName, s3Path, flag)
            updateTaskArnDB(taskArnUpdate, chunkArray, obID)



    # set response for request
    response = { "courseID": courseID, "flag": flag, "taskArnNumber": taskArnUpdate }
    # check
    return response
