//
//  DiskUsage.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation
struct DiskUsage: Codable, Identifiable {
    let id: Int
    let filesystem: String
    let sizeGB: Double
    let usedGB: Double
    let availableGB: Double
    let userId: Int
    let deviceId: String
    let timestamp: String
}
