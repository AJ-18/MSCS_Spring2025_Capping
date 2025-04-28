//
//  CPUUsage.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation

struct CpuCoreUsage: Codable {
    let core: Int
    let usage: Double
}

struct CpuUsage: Decodable {
    let id: Int
    let totalCpuLoad: Double
    let userId: Int
    let deviceId: String
    let timestamp: String
    let perCoreUsage: [CpuCoreUsage]
    
    enum CodingKeys: String, CodingKey {
        case id, totalCpuLoad, userId, deviceId, timestamp, perCoreUsageJson
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(Int.self, forKey: .id)
        totalCpuLoad = try container.decode(Double.self, forKey: .totalCpuLoad)
        userId = try container.decode(Int.self, forKey: .userId)
        deviceId = try container.decode(String.self, forKey: .deviceId)
        timestamp = try container.decode(String.self, forKey: .timestamp)
        
        let jsonString = try container.decode(String.self, forKey: .perCoreUsageJson)
        
        // No cleaning, just decode directly
        if let jsonData = jsonString.data(using: .utf8) {
            perCoreUsage = (try? JSONDecoder().decode([CpuCoreUsage].self, from: jsonData)) ?? []
        } else {
            perCoreUsage = []
        }
    }
    
    // Manual initializer for sample/mock data
    init(id: Int, totalCpuLoad: Double, perCoreUsage: [CpuCoreUsage], userId: Int, deviceId: String, timestamp: String) {
        self.id = id
        self.totalCpuLoad = totalCpuLoad
        self.perCoreUsage = perCoreUsage
        self.userId = userId
        self.deviceId = deviceId
        self.timestamp = timestamp
    }
}
