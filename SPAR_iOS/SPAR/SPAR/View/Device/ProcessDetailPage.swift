//
//  ProcessDetailPage.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI
import Charts

struct ProcessDetailPage: View {
    @ObservedObject private var viewModel: ProcessViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    init(device: DeviceSpecification) {
        let viewModel = ProcessViewModel(device: device)
        self.viewModel = viewModel
        self.device = device
    }

    @State private var showCPU = true // Toggle between CPU and Memory
    
    var body: some View {
        LoadingView(isLoading: viewModel.isLoading) {
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
                    .accessibilityLabel("Metric Picker")

                    Chart {
                        ForEach(viewModel.processList) { process in
                            BarMark(
                                x: .value(StringConstant.process, "\(process.name) (\(process.pid))"),
                                y: .value(showCPU ? StringConstant.cpu : StringConstant.memory, showCPU ? process.cpuUsage : process.memoryMB)
                            )
                            .foregroundStyle(showCPU ? Color.blue : Color.green)
                            .annotation(position: .top) {
                                Text(String(format: "%.1f", showCPU ? process.cpuUsage : process.memoryMB))
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                    .accessibilityLabel(showCPU ? "\(process.cpuUsage)% CPU" : "\(process.memoryMB) MB")
                            }
                        }
                    }
                    .frame(height: 300)
                    .padding(.horizontal)

                    ForEach(viewModel.processList) { process in
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

                            Text("Registered at: \(formattedDate(process.timestamp))")
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
    ProcessDetailPage(device: DeviceSpecification(
        id: 1,
        deviceId: "preview",
        deviceName: "Preview Device",
        manufacturer: "Preview Inc.",
        model: "Model X",
        processor: "Apple M1",
        cpuPhysicalCores: 4,
        cpuLogicalCores: 8,
        installedRam: 16.0,
        graphics: "Integrated",
        operatingSystem: "macOS",
        systemType: "ARM64",
        registeredAt: "2025-04-01T12:00:00Z"
    ))
}
