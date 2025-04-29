//
//  DeviceSpecification.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

struct DeviceSpecification: Codable, Identifiable {
    let id: Int
    let userId: Int
    let deviceName: String
    let manufacturer: String
    let model: String
    let processor: String
    let cpuPhysicalCores: Int
    let cpuLogicalCores: Int
    let installedRam: Double
    let graphics: String
    let operatingSystem: String
    let systemType: String
    let timestamp: String
    
    enum CodingKeys: String, CodingKey {
        case id = "deviceId"
        case userId, deviceName, manufacturer, model, processor
        case cpuPhysicalCores, cpuLogicalCores, installedRam
        case graphics, operatingSystem, systemType, timestamp
    }
}
