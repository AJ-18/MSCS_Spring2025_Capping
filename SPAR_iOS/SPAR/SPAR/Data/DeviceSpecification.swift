//
//  DeviceSpecification.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

struct DeviceSpecification: Codable, Identifiable {
    let id: Int
    let deviceId: String
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
    let registeredAt: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case deviceId,deviceName, manufacturer, model, processor
        case cpuPhysicalCores, cpuLogicalCores, installedRam
        case graphics, operatingSystem, systemType, registeredAt
    }
}
