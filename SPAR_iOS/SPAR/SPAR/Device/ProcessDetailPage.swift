//
//  ProcessDetailPage.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI
import Charts

struct ProcessDetailPage: View {
    @StateObject private var viewModel: ProcessViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    init(device: DeviceSpecification) {
          _viewModel = StateObject(wrappedValue: ProcessViewModel(device: device))
          self.device = device
    }

    @State private var showCPU = true // Toggle between CPU and Memory
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text(StringConstant.processMonitor)
                    .font(.largeTitle)
                    .bold()
                    .padding(.top)
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                Picker(StringConstant.metric, selection: $showCPU) {
                    Text(StringConstant.cpuUsage).tag(true)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                    Text(StringConstant.memoryUsage).tag(false)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                Chart {
                    ForEach(viewModel.processList, id: \.id) { process in
                        BarMark(
                            x: .value(StringConstant.process, "\(process.name) (\(process.pid))"),
                            y: .value(showCPU ? StringConstant.cpu : StringConstant.memory, showCPU ? process.cpuUsage : process.memoryMB)
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

                ForEach(viewModel.processList, id: \.id) { process in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("PID: \(process.pid)")
                                .font(.headline)
                                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                            Spacer()
                            Text(process.name)
                                .fontWeight(.semibold)
                                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
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
                            .minimumScaleFactor(sizeCategory.customMinScaleFactor)
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
        .onAppear {
            self.logPageVisit()
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
    ProcessDetailPage( device: DeviceSpecification(
        id: 1,
        userId: 1,
        deviceName: "MyComputer",
        manufacturer: "Dell",
        model: "Inspiron 15",
        processor: "Intel Core i7 2.8 GHz",
        cpuPhysicalCores: 4,
        cpuLogicalCores: 8,
        installedRam: 16.0,
        graphics: "NVIDIA GTX 1650",
        operatingSystem: "Windows 10 x64",
        systemType: "x64-based processor",
        timestamp: "2025-03-28T16:03:30.041384"
    ))
}
