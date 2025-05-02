//
//  CpuUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI
import Charts

// MARK: - CpuUsageDetailView
struct CpuUsageDetailView: View {
    @StateObject private var viewModel: CpuUsageViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    // MARK: - Init
    init(device: DeviceSpecification) {
        _viewModel = StateObject(wrappedValue: CpuUsageViewModel(device: device))
        self.device = device
    }

    // MARK: - Body
    var body: some View {
        LoadingView(isLoading: viewModel.isLoading) {
            ZStack {
                // MARK: Background Gradient
                LinearGradient(colors: [.orange.opacity(0.2), .yellow.opacity(0.2)],
                               startPoint: .topLeading,
                               endPoint: .bottomTrailing)
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {

                        // MARK: Header
                        Text(StringConstant.cpuUsage)
                            .font(.largeTitle)
                            .bold()
                            .accessibilityAddTraits(.isHeader)
                            .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                        Spacer(minLength: 20)

                        // MARK: Donut Chart
                        if let chartData = viewModel.chartData {
                            HalfDonutChart(chartDataObj: .constant(chartData))
                                .frame(height: 180)
                                .transition(.scale)
                        }

                        Spacer(minLength: 40)

                        // MARK: CPU Usage Information
                        if let usage = viewModel.cpuUsage {
                            VStack(alignment: .leading, spacing: 16) {

                                // MARK: General Info
                                InfoRow(label: StringConstant.deviceName, value: device.deviceName)
                                InfoRow(label: StringConstant.totalCPULoad, value: String(format: "%.1f%%", usage.totalCpuLoad))
                                InfoRow(label: StringConstant.registeredAt, value: usage.timestamp.toFormattedDate())

                                Divider().padding(.vertical, 8)

                                // MARK: Per Core Usage Section (Consider splitting into its own view)
                                Text(StringConstant.allCore)
                                    .font(.headline)

                                ForEach(usage.perCoreUsage, id: \.core) { coreUsage in
                                    InfoRow(label: "Core \(coreUsage.core)", value: String(format: "%.1f%%", coreUsage.usage))
                                }

                                Divider().padding(.vertical, 8)

                                // MARK: Top 5 Core Usage Graph (Consider moving to a ChartSection view)
                                Text(StringConstant.topFive)
                                    .font(.headline)
                                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                                let topCores = usage.perCoreUsage
                                    .sorted { $0.usage > $1.usage }
                                    .prefix(5)

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
            .onAppear {
                // MARK: Log Page Visit
                self.logPageVisit()
        }
        }
    }
}

// MARK: - Preview
#Preview {
    CpuUsageDetailView(device: DeviceSpecification(
        id: 1,
        deviceId: "dd",
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
        registeredAt: "2025-03-28T16:03:30.041384"
    ))
}
