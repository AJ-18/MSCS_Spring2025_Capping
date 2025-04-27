//
//  CPUUsage.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation

// Make sure CpuCoreUsage conforms to Codable
struct CpuCoreUsage: Codable {
    let core: Int
    let usage: Double
}

// Ensure CpuUsage fully conforms to Decodable
struct CpuUsage: Decodable {
    let id: Int
    let totalCpuLoad: Double
    let userId: Int
    let deviceId: String
    let timestamp: String
    let perCoreUsage: [CpuCoreUsage]
    
    // Custom decoding logic
    enum CodingKeys: String, CodingKey {
        case id, totalCpuLoad, userId, deviceId, timestamp, perCoreUsageJson
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Decode the standard fields
        id = try container.decode(Int.self, forKey: .id)
        totalCpuLoad = try container.decode(Double.self, forKey: .totalCpuLoad)
        userId = try container.decode(Int.self, forKey: .userId)
        deviceId = try container.decode(String.self, forKey: .deviceId)
        timestamp = try container.decode(String.self, forKey: .timestamp)
        
        // Decode the perCoreUsageJson string and convert to [CpuCoreUsage]
        let jsonString = try container.decode(String.self, forKey: .perCoreUsageJson)
        let cleanedJsonString = jsonString.replacingOccurrences(of: "\\", with: "")
        
        if let jsonData = cleanedJsonString.data(using: .utf8) {
            do {
                self.perCoreUsage = try JSONDecoder().decode([CpuCoreUsage].self, from: jsonData)
            } catch {
                print("Error decoding core usage JSON: \(error)")
                self.perCoreUsage = []
            }
        } else {
            self.perCoreUsage = []
        }
    }
    
    // Manual initializer for creating sample data
    init(id: Int, totalCpuLoad: Double, perCoreUsageJson: [CpuCoreUsage], userId: Int, deviceId: String, timestamp: String) {
        self.id = id
        self.totalCpuLoad = totalCpuLoad
        self.perCoreUsage = perCoreUsageJson
        self.userId = userId
        self.deviceId = deviceId
        self.timestamp = timestamp
    }
}
