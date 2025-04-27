//
//  MockData.swift
//  SPARTests
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

struct MockData {
    static let sampleDeviceData = """
    [
        {
            "userId": 1,
            "deviceId": 5,
            "deviceName": "MyComputer",
            "manufacturer": "Dell",
            "model": "Inspiron 15",
            "processor": "Intel Core i7 2.8 GHz",
            "cpuPhysicalCores": 4,
            "cpuLogicalCores": 8,
            "installedRam": 16.0,
            "graphics": "NVIDIA GTX 1650",
            "operatingSystem": "Windows 10 x64",
            "systemType": "x64 operating system, x64-based processor",
            "timestamp": "2025-03-28T16:03:30.041384"
        },
        {
            "userId": 1,
            "deviceId": 13,
            "deviceName": "Home",
            "manufacturer": "Dell",
            "model": "Inspiron 15",
            "processor": "Intel Core i7 2.8 GHz",
            "cpuPhysicalCores": 4,
            "cpuLogicalCores": 8,
            "installedRam": 32.0,
            "graphics": "NVIDIA GTX 1650",
            "operatingSystem": "Windows 10 x64",
            "systemType": "x64 operating system, x64-based processor",
            "timestamp": "2025-04-13T15:28:39.97323"
        }
    ]
    """.data(using: .utf8)!

    static let sampleProcessData = """
    [
        {
            "userId": 1,
            "id": 101,
            "pid": 1234,
            "name": "chrome.exe",
            "cpuUsage": 12.5,
            "memoryMB": 200.0,
            "timestamp": "2025-04-13T15:29:00.236114"
        },
        {
            "userId": 1,
            "id": 102,
            "pid": 5678,
            "name": "node.exe",
            "cpuUsage": 5.0,
            "memoryMB": 150.0,
            "timestamp": "2025-04-13T15:29:00.236114"
        }
    ]
    """.data(using: .utf8)!

    static let sampleBatteryData = """
        {
            "userId": 1,
            "id": 7,
            "hasBattery": true,
            "batteryPercentage": 85,
            "powerConsumption": 5.0,
            "timestamp": "2025-04-13T15:29:10.549936",
            "charging": false
        }
    """.data(using: .utf8)!

    static let sampleMemoryUsageData = """
        {
            "userId": 1,
            "id": 7,
            "totalMemory": 16.0,
            "usedMemory": 8.5,
            "availableMemory": 7.5,
            "timestamp": "2025-04-13T15:28:49.261218"
        }
    """.data(using: .utf8)!
    static let sampleDiskUsageData = """
      {
          "id": 5,
          "readSpeedMBps": 120.0,
          "writeSpeedMBps": 80.0,
          "userId": 1,
          "deviceId": "331330ac-5f82-43b0-9d39-84e1f7e7e358",
          "timestamp": "2025-04-22T15:57:10.377292"
      }
    """.data(using: .utf8)!
    static let sampleCPUUsageData = """
     {
         "id": 7,
         "totalCpuLoad": 42.5,
         "perCoreUsageJson": "[{\"core\":1,\"usage\":35.0}]",
         "userId": 1,
         "deviceId": "331330ac-5f82-43b0-9d39-84e1f7e7e358",
         "timestamp": "2025-04-22T15:57:10.351457"
     }
    """.data(using: .utf8)!
    static let sampleDiskIOUsageData = """
       {
           "id": 4,
           "totalMemory": 16.0,
           "usedMemory": 7.2,
           "availableMemory": 8.8,
           "userId": 1,
           "deviceId": "331330ac-5f82-43b0-9d39-84e1f7e7e358",
           "timestamp": "2025-04-22T15:57:10.366022"
       }
    """.data(using: .utf8)!
    static let sampleLoginData = """
    {
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGljZSIsImlhdCI6MTc0NTM1MDY1NCwiZXhwIjo5MjIzNTQ2NTcxOTIwMn0.BypJMZiF7ooVbYXCioOQAljTyjmR9ET5aJTC9auiVxw",
        "userId": 1
    }
    """.data(using: .utf8)!
}


