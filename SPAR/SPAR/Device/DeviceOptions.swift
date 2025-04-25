//
//  DeviceOptions.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

struct DeviceOptions: View {
    @Binding var currentView: AppView
    let device : DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory


    var body: some View {
        ZStack {
            // Cool background
            Color.white

            ScrollView {
                VStack(spacing: 30) {
                    // Device Info Card
                    VStack(alignment: .leading, spacing: 15) {
                        Text(StringConstant.deviceInfo)
                            .font(.largeTitle)
                            .fontWeight(.heavy)
                            .foregroundColor(.white)
                            .padding(.bottom, 10)
                            .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                        Group {
                            DeviceInfoRow(label: StringConstant.deviceName, value: device.deviceName)
                            DeviceInfoRow(label: StringConstant.manufacturer, value: device.manufacturer)
                            DeviceInfoRow(label: StringConstant.model, value: device.model)
                            DeviceInfoRow(label: StringConstant.processor, value: device.processor)
                            DeviceInfoRow(label: StringConstant.physicalCore, value: "\(device.cpuPhysicalCores)")
                            DeviceInfoRow(label: StringConstant.logicalCores, value: "\(device.cpuLogicalCores)")
                            DeviceInfoRow(label: StringConstant.RAM, value: "\(device.installedRam) GB")
                            DeviceInfoRow(label: StringConstant.graphics, value: device.graphics)
                            DeviceInfoRow(label: StringConstant.OS, value: device.operatingSystem)
                            DeviceInfoRow(label: StringConstant.systemType, value: device.systemType)
                            DeviceInfoRow(label: StringConstant.timestamp, value: device.timestamp.toFormattedDate())
                        }
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 20)
                            .fill(Color(red: 20/255, green: 20/255, blue: 20/255)) // Charcoal dark
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(LinearGradient(colors: [.green, .mint], startPoint: .topLeading, endPoint: .bottomTrailing), lineWidth: 2)
                            )
                    )
                    .padding(.horizontal)
                    .shadow(color: Color.green.opacity(0.4), radius: 10)


                    // Glowing Navigation Buttons
                    VStack(spacing: 20) {
                        NavigationButton(title: StringConstant.batteryInfo) {
                          
                            BatteryDetailView(device: device) }
                        NavigationButton(title: StringConstant.cpu) { CpuUsageDetailView(device: device) }
                        NavigationButton(title: StringConstant.memoryUsage) { MemoryUsageDetailView(device: device) }
                        NavigationButton(title: StringConstant.diskUsage) { DiskUsageDetailView(device: device) }
                        NavigationButton(title: StringConstant.diskIO) { DiskIODetailView(device: device) }
                        NavigationButton(title: StringConstant.processlist) { ProcessDetailPage(device: device) }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
        }
        .navigationTitle(StringConstant.details)
        .onAppear {
            self.logPageVisit()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

// Device Info Row - Modernized
struct DeviceInfoRow: View {
    let label: String
    let value: String
    @Environment(\.sizeCategory) var sizeCategory


    var body: some View {
        HStack {
            Text(label + ":")
                .foregroundColor(.white)
                .fontWeight(.semibold)
                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
            Spacer()
            Text(value)
                .foregroundColor(.cyan)
                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
        }
        .font(.system(size: 16, design: .rounded))
    }
}



// MARK: - Preview
#Preview {
    NavigationStack {
        DeviceOptions(currentView: .constant(.detailPage), device: DeviceSpecification(
            id: 1,
            userId: "User123",
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
}
