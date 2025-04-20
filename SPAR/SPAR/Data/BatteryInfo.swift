//
//  BatteryInfo.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

struct BatteryInfo: Codable, Identifiable {
    let id: Int
    let userId: String
    let hasBattery: Bool
    let batteryPercentage: Int
    let powerConsumption: Double
    let timestamp: String
    let charging: Bool
}
