//
//  CpuUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI
import SwiftUI
import Charts

struct CpuUsageDetailView: View {
    @StateObject private var viewModel = CpuUsageViewModel()

    var body: some View {
        ZStack {
            LinearGradient(colors: [.orange.opacity(0.2), .yellow.opacity(0.2)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    Text("CPU Usage")
                        .font(.largeTitle)
                        .bold()
                        .accessibilityAddTraits(.isHeader)

                    Spacer(minLength: 20)

                    // Display chart with HalfDonutChart
                    if let chartData = viewModel.chartData {
                        HalfDonutChart(chartDataObj: .constant(chartData))
                            .frame(height: 180)
                            .transition(.scale)
                    }
                    
                    Spacer(minLength: 40)

                    // Display CPU Usage Details
                    if let usage = viewModel.cpuUsage {
                        VStack(alignment: .leading, spacing: 16) {
                            InfoRow(label: "Total CPU Load", value: String(format: "%.1f%%", usage.totalCpuLoad))
                            InfoRow(label: "Device ID", value: usage.deviceId)
                            InfoRow(label: "Timestamp", value: usage.timestamp)

                            Divider().padding(.vertical, 8)

                            // Display Per-Core Usage List
                            Text("All Core Usage")
                                .font(.headline)

                            ForEach(usage.perCoreUsage, id: \.core) { coreUsage in
                                InfoRow(label: "Core \(coreUsage.core)", value: String(format: "%.1f%%", coreUsage.usage))
                            }

                            Divider().padding(.vertical, 8)

                            // Display Top 5 Core Usage with Bar Graph
                            Text("Top 5 Core Usage")
                                .font(.headline)

                            // Get top 5 cores sorted by usage
                            let topCores = usage.perCoreUsage.sorted { $0.usage > $1.usage }.prefix(5)

                            Chart {
                                ForEach(topCores, id: \.core) { coreUsage in
                                    BarMark(
                                        x: .value("Core", "Core \(coreUsage.core)"),
                                        y: .value("Usage", coreUsage.usage)
                                    )
                                    .foregroundStyle(.blue.gradient)
                                }
                            }
                            .frame(height: 200)
                            .cornerRadius(10)
                            .padding(.top, 8)
                        }
                        .padding()
                        .frame(maxWidth: 360)
                        .background(Color.white)
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 5)
                    }

                    Spacer()
                }
                .padding()
                .animation(.easeInOut, value: viewModel.cpuUsage?.totalCpuLoad)
            }
        }
    }
}

#Preview {
    CpuUsageDetailView()
}
