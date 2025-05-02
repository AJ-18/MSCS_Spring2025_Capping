//
//  CPUUsage.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation

// MARK: - CpuCoreUsage model
struct CpuCoreUsage: Codable {
    let core: Int
    let usage: Double
}

// Fixed CpuUsage struct with better JSON handling
struct CpuUsage: Codable {
    let id: Int
    let totalCpuLoad: Double
    let userId: Int
    let deviceId: String
    let timestamp: String
    let perCoreUsage: [CpuCoreUsage]
    
    // Custom encoding for when we need to convert back to the API format
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(id, forKey: .id)
        try container.encode(totalCpuLoad, forKey: .totalCpuLoad)
        try container.encode(userId, forKey: .userId)
        try container.encode(deviceId, forKey: .deviceId)
        try container.encode(timestamp, forKey: .timestamp)
        
        // Convert perCoreUsage to a JSON string
        let perCoreData = try JSONEncoder().encode(perCoreUsage)
        if let perCoreString = String(data: perCoreData, encoding: .utf8) {
            try container.encode(perCoreString, forKey: .perCoreUsageJson)
        }
    }
    
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
        
        // Try to decode the perCoreUsageJson string
        let jsonString = try container.decode(String.self, forKey: .perCoreUsageJson)
        
        // First attempt: direct decoding
        if let data = jsonString.data(using: .utf8) {
            do {
                perCoreUsage = try JSONDecoder().decode([CpuCoreUsage].self, from: data)
                return
            } catch {
                print("First parse attempt failed: \(error)")
            }
        }
        
        // Second attempt: clean the string and try again
        let cleanedJsonString = jsonString
            .replacingOccurrences(of: "\\\"", with: "\"")
            .replacingOccurrences(of: "\\\\", with: "\\")
        
        if let data = cleanedJsonString.data(using: .utf8) {
            do {
                perCoreUsage = try JSONDecoder().decode([CpuCoreUsage].self, from: data)
                return
            } catch {
                print("Second parse attempt failed: \(error)")
            }
        }
        
        // If all else fails, provide default values
        print("Using default values for perCoreUsage")
        perCoreUsage = []
    }
    
    // Convenience initializer (not used in decoding)
    init(id: Int, totalCpuLoad: Double, perCoreUsage: [CpuCoreUsage], userId: Int, deviceId: String, timestamp: String) {
        self.id = id
        self.totalCpuLoad = totalCpuLoad
        self.perCoreUsage = perCoreUsage
        self.userId = userId
        self.deviceId = deviceId
        self.timestamp = timestamp
    }
}

