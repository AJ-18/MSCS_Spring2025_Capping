//
//  DiskIODetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import SwiftUI
import Charts

// MARK: - DiskIODetailView
struct DiskIODetailView: View {
    @StateObject private var viewModel: DiskIOViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    // MARK: - Init
    init(device: DeviceSpecification) {
        _viewModel = StateObject(wrappedValue: DiskIOViewModel(device: device))
        self.device = device
    }

    // MARK: - Body
    var body: some View {
        LoadingView(isLoading: viewModel.isLoading) {
            ZStack {
                // MARK: Background Gradient
                LinearGradient(colors: [.blue.opacity(0.2), .purple.opacity(0.2)],
                               startPoint: .topLeading,
                               endPoint: .bottomTrailing)
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        // MARK: Header
                        Text(StringConstant.diskIOUssage)
                            .font(.largeTitle)
                            .bold()
                            .accessibilityAddTraits(.isHeader)
                            .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                        Spacer(minLength: 20)

                        // MARK: Disk IO Information Section
                        if let diskIO = viewModel.diskIO {
                            DiskIOInfoSection(diskIO: diskIO, device: device)
                        }

                        Spacer()
                    }
                    .padding()
                }
            }
            .onAppear {
                // MARK: Log Page Visit
                self.logPageVisit()
        }
        }
    }
}

// MARK: - DiskIOInfoSection
struct DiskIOInfoSection: View {
    let diskIO: DiskIO
    let device: DeviceSpecification

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // MARK: Basic Info
            InfoRow(label: StringConstant.deviceName, value: device.deviceName) // Update with device value
            InfoRow(label: StringConstant.RS, value: String(format: "%.1f MBps", diskIO.readSpeedMBps))
            InfoRow(label: StringConstant.WS, value: String(format: "%.1f MBps", diskIO.writeSpeedMBps))
            InfoRow(label: StringConstant.registeredAt, value: diskIO.timestamp.toFormattedDate())

            Divider().padding(.vertical, 8)

            // MARK: Disk IO Chart
            Text(StringConstant.diskIOChart)
                .font(.headline)
                .minimumScaleFactor(0.75)

            DiskIOChart(diskIO: diskIO)
        }
        .padding()
        .frame(maxWidth: 360)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 5)
    }
}

// MARK: - DiskIOChart
struct DiskIOChart: View {
    let diskIO: DiskIO

    var body: some View {
        Chart {
            // MARK: Read Speed Bar
            BarMark(
                x: .value("Read", "Read Speed"),
                y: .value("Speed", diskIO.readSpeedMBps)
            )
            .foregroundStyle(.green)

            // MARK: Write Speed Bar
            BarMark(
                x: .value("Write", "Write Speed"),
                y: .value("Speed", diskIO.writeSpeedMBps)
            )
            .foregroundStyle(.red)
        }
        .frame(height: 200)
        .cornerRadius(10)
        .padding(.top, 8)
    }
}

// MARK: - Preview
#Preview {
    DiskIODetailView(device: DeviceSpecification(
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
