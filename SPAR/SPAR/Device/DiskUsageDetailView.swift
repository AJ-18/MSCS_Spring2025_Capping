//
//  DiskUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI

struct DiskUsageDetailView: View {
    @StateObject private var viewModel: DiskUsageViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    init(device: DeviceSpecification) {
          _viewModel = StateObject(wrappedValue: DiskUsageViewModel(device: device))
          self.device = device
    }

    var body: some View {
        ZStack {
            LinearGradient(colors: [.purple.opacity(0.15), .blue.opacity(0.15)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 30) {
                Text(StringConstant.diskUsage)
                    .font(.largeTitle)
                    .bold()
                    .accessibilityAddTraits(.isHeader)
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                // Disk usage donut chart
                HalfDonutChart(chartDataObj: $viewModel.chartData)

                if let diskInfo = viewModel.diskUsage {
                    VStack(alignment: .leading, spacing: 15) {
                        InfoRow(label: StringConstant.deviceName, value: device.deviceName)
                        InfoRow(label: StringConstant.filesystem, value: diskInfo.filesystem)
                        InfoRow(label: StringConstant.size, value: String(format: "%.2f GB", diskInfo.sizeGB))
                        InfoRow(label: StringConstant.usedSpace, value: String(format: "%.2f GB", diskInfo.usedGB))
                        InfoRow(label: StringConstant.availableSpace, value: String(format: "%.2f GB", diskInfo.availableGB))
                        InfoRow(label: StringConstant.timestamp, value: diskInfo.timestamp)
                    }
                    .padding()
                    .frame(maxWidth: 320)
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)
                } else {
                    Text(viewModel.errorMessage)
                        .foregroundColor(.red)
                        .font(.body)
                }

                Spacer()
            }
            .padding()
        }
        .onAppear {
            self.logPageVisit()
        }
    }
}

#Preview {
    DiskUsageDetailView(device: DeviceSpecification(
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



