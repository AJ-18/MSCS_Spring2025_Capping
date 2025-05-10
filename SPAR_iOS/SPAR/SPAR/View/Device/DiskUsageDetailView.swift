//
//  DiskUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI

// MARK: - DiskUsageDetailView
import SwiftUI

// MARK: - DiskUsageDetailView
struct DiskUsageDetailView: View {
    @StateObject private var viewModel: DiskUsageViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    init(device: DeviceSpecification) {
        _viewModel = StateObject(wrappedValue: DiskUsageViewModel(device: device))
        self.device = device
    }

    var body: some View {
        LoadingView(isLoading: viewModel.isLoading) {
            ZStack {
                LinearGradient(colors: [.purple.opacity(0.15), .blue.opacity(0.15)], startPoint: .top, endPoint: .bottom)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 30) {
                        Text(StringConstant.diskUsage)
                            .font(.largeTitle)
                            .bold()
                            .accessibilityAddTraits(.isHeader)
                            .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                        if !viewModel.diskUsage.isEmpty {
                            ForEach(viewModel.diskUsage, id: \.id) { disk in
                                VStack(alignment: .leading, spacing: 15) {
                                    InfoRow(label: StringConstant.deviceName, value: device.deviceName)
                                    InfoRow(label: StringConstant.filesystem, value: disk.filesystem)
                                    InfoRow(label: StringConstant.size, value: String(format: "%.2f GB", disk.sizeGB))
                                    InfoRow(label: StringConstant.usedSpace, value: String(format: "%.2f GB", disk.usedGB))
                                    InfoRow(label: StringConstant.availableSpace, value: String(format: "%.2f GB", disk.availableGB))
                                    InfoRow(label: StringConstant.registeredAt, value: disk.timestamp.toFormattedDate())

                                    DiskUsageBarView(used: disk.usedGB, total: disk.sizeGB)
                                }
                                .padding()
                                .frame(maxWidth: 320)
                                .background(Color.white)
                                .cornerRadius(12)
                                .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)
                            }
                        } else {
                            Text(viewModel.errorMessage)
                                .foregroundColor(.red)
                                .font(.body)
                        }

                        Spacer(minLength: 20)
                    }
                    .padding()
                }
            }
            .onAppear {
                self.logPageVisit()
            }
        }
    }
}

struct DiskUsageBarView: View {
    var used: Double
    var total: Double

    private var percentageUsed: Double {
        guard total > 0 else { return 0 }
        return (used / total) * 100
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Disk Usage")
                .font(.headline)
                .foregroundColor(.primary)

            ZStack(alignment: .leading) {
                // Background bar
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.gray.opacity(0.15))
                    .frame(height: 22)

                // Foreground bar with gradient and animation
                GeometryReader { geometry in
                    let barWidth = geometry.size.width * CGFloat(percentageUsed / 100)

                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(
                                LinearGradient(
                                    gradient: Gradient(colors: [.blue, .purple]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: barWidth, height: 22)
                            .shadow(color: Color.blue.opacity(0.3), radius: 4, x: 0, y: 2)

                        // Percentage text inside the bar if there's space
                        if barWidth > 60 {
                            Text(String(format: "%.0f%%", percentageUsed))
                                .font(.caption.bold())
                                .foregroundColor(.white)
                                .padding(.horizontal, 8)
                        }
                    }
                    .animation(.easeInOut, value: percentageUsed)
                }
                .frame(height: 22)
            }
            .clipShape(RoundedRectangle(cornerRadius: 10))

            // Used Info below
            Text(String(format: "Used: %.2f GB of %.2f GB", used, total))
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 6)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Disk usage: \(Int(percentageUsed)) percent used, \(used) gigabytes of \(total) gigabytes")
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
