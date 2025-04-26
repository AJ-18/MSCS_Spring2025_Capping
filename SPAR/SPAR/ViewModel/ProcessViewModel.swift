//
//  ProcessViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import Foundation

class ProcessViewModel: ObservableObject {
    @Published var processList: [ProcessStatus]
    
    init(device: DeviceSpecification) {
         processList
        = [
            ProcessStatus(id: 101, userId: 1, pid: 1234, name: "chrome.exe", cpuUsage: 12.5, memoryMB: 200.0, timestamp: "2025-04-13T15:29:00.236114".toFormattedDate()),
            ProcessStatus(id: 102, userId: 1, pid: 5678, name: "node.exe", cpuUsage: 5.0, memoryMB: 150.0, timestamp: "2025-04-13T15:29:00.236114".toFormattedDate()),
            ProcessStatus(id: 103, userId: 1, pid: 1234, name: "chrome.exe", cpuUsage: 12.5, memoryMB: 200.0, timestamp: "2025-04-19T11:33:17.675373".toFormattedDate()),
            ProcessStatus(id: 104, userId: 1, pid: 5678, name: "node.exe", cpuUsage: 5.0, memoryMB: 150.0, timestamp: "2025-04-19T11:33:17.675373".toFormattedDate())
        ]
    }

}
