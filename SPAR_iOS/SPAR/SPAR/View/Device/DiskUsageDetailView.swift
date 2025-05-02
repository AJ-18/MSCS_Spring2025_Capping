//
//  DiskUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI

// MARK: - DiskUsageDetailView
struct DiskUsageDetailView: View {
    @StateObject private var viewModel: DiskUsageViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    // MARK: - Init
    init(device: DeviceSpecification) {
        _viewModel = StateObject(wrappedValue: DiskUsageViewModel(device: device))
        self.device = device
    }

    // MARK: - Body
    var body: some View {
        ZStack {
            // MARK: Background Gradient
            LinearGradient(colors: [.purple.opacity(0.15), .blue.opacity(0.15)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 30) {
                
                // MARK: Header
                Text(StringConstant.diskUsage)
                    .font(.largeTitle)
                    .bold()
                    .accessibilityAddTraits(.isHeader)
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                // MARK: Disk Usage Donut Chart
                HalfDonutChart(chartDataObj: $viewModel.chartData)

                // MARK: Disk Info Display
                if let diskInfo = viewModel.diskUsage {
                    VStack(alignment: .leading, spacing: 15) {
                        InfoRow(label: StringConstant.deviceName, value: device.deviceName)
                        InfoRow(label: StringConstant.filesystem, value: diskInfo.filesystem)
                        InfoRow(label: StringConstant.size, value: String(format: "%.2f GB", diskInfo.sizeGB))
                        InfoRow(label: StringConstant.usedSpace, value: String(format: "%.2f GB", diskInfo.usedGB))
                        InfoRow(label: StringConstant.availableSpace, value: String(format: "%.2f GB", diskInfo.availableGB))
                        InfoRow(label: StringConstant.registeredAt, value: diskInfo.timestamp.toFormattedDate())
                    }
                    .padding()
                    .frame(maxWidth: 320)
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)
                } else {
                    // MARK: Error Message
                    Text(viewModel.errorMessage)
                        .foregroundColor(.red)
                        .font(.body)
                }

                Spacer()
            }
            .padding()
        }
        .onAppear {
            // MARK: Log Page Visit
            self.logPageVisit()
        }
    }
}

// MARK: - Preview
#Preview {
    DiskUsageDetailView(device: DeviceSpecification(
        id: 1,
        deviceId: "ff",
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
