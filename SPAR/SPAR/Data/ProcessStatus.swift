//
//  ProcessStatus.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

struct ProcessStatus: Codable, Identifiable {
    let id: Int
    let userId: String
    let pid: Int
    let name: String
    let cpuUsage: Double
    let memoryMB: Double
    let timestamp: String
}
