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

def getIP(taskArnNumber):


    ecsClient = boto3.client('ecs')
    ec2Client = boto3.client('ec2')

    response = ecsClient.describe_tasks(
        cluster = 'CompCheckCluster',
        tasks = [
            taskArnNumber
        ]
    )

    try:
        eniNumber = response['tasks'][0]['attachments'][0]['details'][1]['value']

    except:

        return "NotRunningYet"

    ipAddressGet = ec2Client.describe_network_interfaces(
        NetworkInterfaceIds=[eniNumber]
    )

    try:
        ipAddress = ipAddressGet['NetworkInterfaces'][0]['Association']['PublicIp']
        return ipAddress
    except:
        return "NotRunningYet"


def checkIfRunning(taskArnNumber):

    ecsClient = boto3.client('ecs')

    responseTasks = ecsClient.describe_tasks(

    cluster='CompCheckCluster',
    tasks=[
        taskArnNumber,
    ],
    )

    return responseTasks



def lambda_handler(event, context):

    # get code from payload
    taskArnNumber = event['body']['taskArnNumber']

    runningResponse = checkIfRunning(taskArnNumber)

    runningCheck = runningResponse['tasks'][0]['lastStatus']

    if (runningCheck == 'RUNNING'):

        labIPAddress = getIP(taskArnNumber)

        response = { "ipAddress": labIPAddress }

    else:

        response = { "ipAddress": "NotRunningYet" }

    return response
