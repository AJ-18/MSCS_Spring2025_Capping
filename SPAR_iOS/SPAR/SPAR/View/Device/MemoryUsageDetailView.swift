//
//  MemoryUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

// MARK: - MemoryUsageDetailView (Main View)
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
            // MARK: Background
            LinearGradient(colors: [.mint.opacity(0.2), .cyan.opacity(0.2)],
                           startPoint: .top,
                           endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 30) {
                // MARK: Title
                Text("Ram Usage")
                    .font(.largeTitle)
                    .bold()
                    .accessibilityAddTraits(.isHeader)
                    .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                // MARK: Memory Usage Chart
                HalfDonutChart(chartDataObj: $viewModel.chartData)

                // MARK: Info Section
                MemoryInfoCard(device: device, viewModel: viewModel)

                Spacer()
            }
            .padding()
        }
        .onAppear {
            self.logPageVisit()
        }
    }
}

// MARK: - Memory Info Card View
struct MemoryInfoCard: View {
    let device: DeviceSpecification
    @ObservedObject var viewModel: MemoryUsageViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            InfoRow(label: StringConstant.deviceName, value: device.deviceName)
            InfoRow(label: StringConstant.totalMemeory,
                    value: String(format: "%.2f GB", viewModel.memoryInfo.totalMemory))
            InfoRow(label: StringConstant.usedMemory,
                    value: String(format: "%.2f GB", viewModel.memoryInfo.usedMemory))
            InfoRow(label: StringConstant.availableMemory,
                    value: String(format: "%.2f GB", viewModel.memoryInfo.availableMemory))
            InfoRow(label: StringConstant.registeredAt,
                    value: viewModel.memoryInfo.timestamp.toFormattedDate())
        }
        .padding()
        .frame(maxWidth: 320)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)
    }
}

// MARK: - Preview
#Preview {
    MemoryUsageDetailView(device: DeviceSpecification(
        id: 1,
        deviceId: "",
        deviceName: "",
        manufacturer: "",
        model: "",
        processor: "",
        cpuPhysicalCores: 4,
        cpuLogicalCores: 8,
        installedRam: 16.0,
        graphics: "NVIDIA GTX 1650",
        operatingSystem: "Windows 10 x64",
        systemType: "x64-based processor",
        registeredAt: "2025-03-28T16:03:30.041384"
    ))
}
