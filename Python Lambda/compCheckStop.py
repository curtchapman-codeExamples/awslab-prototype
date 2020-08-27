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


def stopInstance(ecsTaskArn):
    ecsClient = boto3.client('ecs')
    stopResponse = ecsClient.stop_task(
        cluster='CompCheckCluster',
        task= ecsTaskArn,
        reason='Shutdown Requested'
    )

    stopCode = stopResponse['task']['stopCode']

    if stopCode == "UserInitiated":
        return "success"
    else:
        return "fail"


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
                    dbTask : ''
                }
            }
        )

def lambda_handler(event, context):

    # get code from payload
    obID = event['body']['obID']
    chunkArray = event['body']['chunkArray']
    taskArn = event['body']['taskArnNumber']

    stopCode = stopInstance(taskArn)
    updateTaskArnDB(taskArn, chunkArray, obID)

    # set response for request
    response = { "response": stopCode }
    # check
    return response
