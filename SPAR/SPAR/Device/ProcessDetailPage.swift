//
//  ProcessDetailPage.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI
import Charts

struct ProcessDetailPage: View {
    let processList: [ProcessStatus]
    
    @State private var showCPU = true // Toggle between CPU and Memory
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("Process Monitor")
                    .font(.largeTitle)
                    .bold()
                    .padding(.top)

                Picker("Metric", selection: $showCPU) {
                    Text("CPU Usage").tag(true)
                    Text("Memory Usage").tag(false)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                Chart {
                    ForEach(processList, id: \.id) { process in
                        BarMark(
                            x: .value("Process", "\(process.name) (\(process.pid))"),
                            y: .value(showCPU ? "CPU" : "Memory", showCPU ? process.cpuUsage : process.memoryMB)
                        )
                        .foregroundStyle(showCPU ? Color.blue : Color.green)
                        .annotation(position: .top) {
                            Text(String(format: "%.1f", showCPU ? process.cpuUsage : process.memoryMB))
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                }
                .frame(height: 300)
                .padding(.horizontal)

                ForEach(processList, id: \.id) { process in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("PID: \(process.pid)")
                                .font(.headline)
                            Spacer()
                            Text(process.name)
                                .fontWeight(.semibold)
                        }

                        HStack {
                            Label(String(format: "%.1f%% CPU", process.cpuUsage), systemImage: "cpu")
                            Spacer()
                            Label(String(format: "%.1f MB", process.memoryMB), systemImage: "memorychip")
                        }
                        .font(.subheadline)
                        .foregroundColor(.gray)

                        Text("Timestamp: \(formattedDate(process.timestamp))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(.white)
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 4)
                    .padding(.horizontal)
                }
                
                Spacer(minLength: 40)
            }
        }
        .background(Color(.systemGroupedBackground).ignoresSafeArea())
    }

    private func formattedDate(_ isoString: String) -> String {
        let isoFormatter = ISO8601DateFormatter()
        if let date = isoFormatter.date(from: isoString) {
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            formatter.timeStyle = .short
            return formatter.string(from: date)
        }
        return isoString
    }
}



#Preview {
    ProcessDetailPage(processList: [
        ProcessStatus(id: 101, userId: "user123", pid: 1234, name: "chrome.exe", cpuUsage: 12.5, memoryMB: 200.0, timestamp: "2025-04-13T15:29:00.236114"),
        ProcessStatus(id: 102, userId: "user123", pid: 5678, name: "node.exe", cpuUsage: 5.0, memoryMB: 150.0, timestamp: "2025-04-13T15:29:00.236114"),
        ProcessStatus(id: 103, userId: "user123", pid: 1234, name: "chrome.exe", cpuUsage: 12.5, memoryMB: 200.0, timestamp: "2025-04-19T11:33:17.675373"),
        ProcessStatus(id: 104, userId: "user123", pid: 5678, name: "node.exe", cpuUsage: 5.0, memoryMB: 150.0, timestamp: "2025-04-19T11:33:17.675373")
    ])
}
