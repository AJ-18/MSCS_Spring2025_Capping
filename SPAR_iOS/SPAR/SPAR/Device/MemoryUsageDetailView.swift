//
//  MemoryUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

struct MemoryUsageDetailView: View {
    @StateObject private var viewModel: MemoryUsageViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    init(device: DeviceSpecification) {
          _viewModel = StateObject(wrappedValue: MemoryUsageViewModel(device: device))
          self.device = device
    }

    var body: some View {
        ZStack {
            LinearGradient(colors: [.mint.opacity(0.2), .cyan.opacity(0.2)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 30) {
                Text("Memory Usage")
                    .font(.largeTitle)
                    .bold()
                    .accessibilityAddTraits(.isHeader)
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                // Pass chart data from viewModel to the HalfDonutChart
                HalfDonutChart(chartDataObj: $viewModel.chartData)

                VStack(alignment: .leading, spacing: 15) {
                    InfoRow(label: StringConstant.deviceName, value: device.deviceName)
                    InfoRow(label: StringConstant.totalMemeory, value: String(format: "%.2f GB", viewModel.memoryInfo.totalMemory))
                    InfoRow(label: StringConstant.usedMemory, value: String(format: "%.2f GB", viewModel.memoryInfo.usedMemory))
                    InfoRow(label: StringConstant.availableMemory, value: String(format: "%.2f GB", viewModel.memoryInfo.availableMemory))
                    InfoRow(label: StringConstant.timestamp, value: viewModel.memoryInfo.timestamp.toFormattedDate())
                }
                .padding()
                .frame(maxWidth: 320)
                .background(Color.white)
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)

                Spacer()
            }
            .padding()
        }.onAppear {
            self.logPageVisit()

        }
    }
}

#Preview {
    MemoryUsageDetailView(device: DeviceSpecification(
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
