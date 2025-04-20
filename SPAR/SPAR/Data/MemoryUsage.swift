//
//  MemoryUsage.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

struct MemoryUsage: Codable, Identifiable {
    let id: Int
    let userId: String
    let totalMemory: Double
    let usedMemory: Double
    let availableMemory: Double
    let timestamp: String
}

