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

    var body: some View {
        ZStack {
            // Cool background
            Color.white

            ScrollView {
                VStack(spacing: 30) {
                    // Device Info Card
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Device Info")
                            .font(.largeTitle)
                            .fontWeight(.heavy)
                            .foregroundColor(.white)
                            .padding(.bottom, 10)

                        Group {
                            DeviceInfoRow(label: "Device Name", value: device.deviceName)
                            DeviceInfoRow(label: "Manufacturer", value: device.manufacturer)
                            DeviceInfoRow(label: "Model", value: device.model)
                            DeviceInfoRow(label: "Processor", value: device.processor)
                            DeviceInfoRow(label: "Physical Cores", value: "\(device.cpuPhysicalCores)")
                            DeviceInfoRow(label: "Logical Cores", value: "\(device.cpuLogicalCores)")
                            DeviceInfoRow(label: "RAM", value: "\(device.installedRam) GB")
                            DeviceInfoRow(label: "Graphics", value: device.graphics)
                            DeviceInfoRow(label: "OS", value: device.operatingSystem)
                            DeviceInfoRow(label: "System Type", value: device.systemType)
                            DeviceInfoRow(label: "Timestamp", value: device.timestamp.toFormattedDate())
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
                        NavigationButton(title: "Battery Info") {
                            BatteryDetailView(device: device) }
                        NavigationButton(title: "CPU") { CpuUsageDetailView(device: device) }
                        NavigationButton(title: "Memory Ussage") { MemoryUsageDetailView(device: device) }
                        NavigationButton(title: "Disk Ussage ") { DiskUsageDetailView(device: device) }
                        NavigationButton(title: "Disk IO ") { DiskIODetailView(device: device) }
                        NavigationButton(title: "Running Processes") { ProcessDetailPage(device: device) }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
        }
        .navigationTitle("Details")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// Device Info Row - Modernized
struct DeviceInfoRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label + ":")
                .foregroundColor(.white)
                .fontWeight(.semibold)
            Spacer()
            Text(value)
                .foregroundColor(.cyan)
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
