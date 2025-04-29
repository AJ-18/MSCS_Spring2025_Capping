//
//  ChartDataContainer.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 3/15/25.
//

import SwiftUI

class ChartDataContainer: ObservableObject {
    @Published var cpuData: ChartData = ChartData(color: Color(#colorLiteral(red: 1, green: 0.493, blue: 0.474, alpha: 1)), type: "CPU", percent: 30)
    @Published var diskData: ChartData = ChartData(color: Color(.green), type: "Disk", percent: 85)
    @Published var MemooryData: ChartData = ChartData(color: Color(#colorLiteral(red: 0.2196078449, green: 0.007843137719, blue: 0.8549019694, alpha: 1)), type: "Memory", percent: 90)

 
}
