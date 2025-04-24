//
//  MemoryUsageViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

class MemoryUsageViewModel: ObservableObject {
    @Published var memoryInfo: MemoryUsage
    
    @Published var chartData: ChartData

    init() {
        // Initializing with some default data or fetching from an API or database.
        let memoryInfo = MemoryUsage(
            id: 1,
            userId: "User",
            totalMemory: 16.0,
            usedMemory: 8.5,
            availableMemory: 7.5,
            timestamp: "2025-04-19".toFormattedDate()
        )
        self.memoryInfo = memoryInfo
        
        let usedPercent = (memoryInfo.usedMemory / memoryInfo.totalMemory) * 100
        self.chartData = ChartData(
            color: Color.purple,
            type: "Memory",
            percent: CGFloat(usedPercent)
        )
    }
}

