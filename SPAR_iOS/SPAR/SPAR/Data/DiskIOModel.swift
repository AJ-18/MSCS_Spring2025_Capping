//
//  DiskIOModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation

struct DiskIO: Codable, Identifiable {
    let id: Int
    let readSpeedMBps: Double
    let writeSpeedMBps: Double
    let userId: Int
    let deviceId: String
    let timestamp: String
}
