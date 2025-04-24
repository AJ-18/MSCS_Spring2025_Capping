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

struct CpuUsage: Codable, Identifiable {
    let id: Int
    let totalCpuLoad: Double
    let perCoreUsage: [CpuCoreUsage]
    let userId: Int
    let deviceId: String
    let timestamp: String

    private enum CodingKeys: String, CodingKey {
        case id, totalCpuLoad, perCoreUsageJson, userId, deviceId, timestamp
    }

    // Manual initializer for use in mock/sample data
    init(id: Int, totalCpuLoad: Double, perCoreUsage: [CpuCoreUsage], userId: Int, deviceId: String, timestamp: String) {
        self.id = id
        self.totalCpuLoad = totalCpuLoad
        self.perCoreUsage = perCoreUsage
        self.userId = userId
        self.deviceId = deviceId
        self.timestamp = timestamp
    }

    // Decoding from API response
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        id = try container.decode(Int.self, forKey: .id)
        totalCpuLoad = try container.decode(Double.self, forKey: .totalCpuLoad)
        userId = try container.decode(Int.self, forKey: .userId)
        deviceId = try container.decode(String.self, forKey: .deviceId)
        timestamp = try container.decode(String.self, forKey: .timestamp)

        let jsonString = try container.decode(String.self, forKey: .perCoreUsageJson)
        let jsonData = Data(jsonString.utf8)
        perCoreUsage = try JSONDecoder().decode([CpuCoreUsage].self, from: jsonData)
    }

    // Encoding back to JSON string
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)

        try container.encode(id, forKey: .id)
        try container.encode(totalCpuLoad, forKey: .totalCpuLoad)
        try container.encode(userId, forKey: .userId)
        try container.encode(deviceId, forKey: .deviceId)
        try container.encode(timestamp, forKey: .timestamp)

        let jsonData = try JSONEncoder().encode(perCoreUsage)
        let jsonString = String(data: jsonData, encoding: .utf8)!
        try container.encode(jsonString, forKey: .perCoreUsageJson)
    }
}
