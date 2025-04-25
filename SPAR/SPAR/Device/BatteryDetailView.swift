//
//  BatteryDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

struct BatteryDetailView: View {
    @StateObject private var viewModel: BatteryViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    init(device: DeviceSpecification) {
          _viewModel = StateObject(wrappedValue: BatteryViewModel(device: device))
          self.device = device
    }

    var body: some View {
        ZStack {
            // Background
            LinearGradient(colors: [.blue.opacity(0.15), .purple.opacity(0.2)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack {
                Spacer()

                VStack(spacing: 30) {
                    // Title
                    Text(StringConstant.batteryStatus)
                        .font(.title)
                        .fontWeight(.bold)
                        .accessibilityAddTraits(.isHeader)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                    // Battery Visualization
                    VStack(spacing: 8) {
                        ZStack(alignment: .leading) {
                            // Outer battery shell
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 2)
                                .frame(width: 200, height: 80)
                                .background(Color.white.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 12))

                            // Fill bar
                            RoundedRectangle(cornerRadius: 10)
                                .fill(batteryColor)
                                .frame(width: batteryFillWidth, height: 70)
                                .animation(.easeInOut(duration: 0.5), value: viewModel.batteryInfo.batteryPercentage)
                                .padding(.leading, 5)

                            // Percentage text
                            Text("\(viewModel.batteryInfo.batteryPercentage)%")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .frame(width: 200, height: 80)
                                .background(Color.clear)
                                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
                        }

            
                    }

                    // Info Rows
                    VStack(alignment: .leading, spacing: 15) {
                        InfoRow(label: StringConstant.deviceName, value: device.deviceName)
                        InfoRow(label: StringConstant.Charging, value: viewModel.batteryInfo.charging ? StringConstant.batYes : StringConstant.batNo)
                        InfoRow(label: StringConstant.power, value: String(format: "%.2f W", viewModel.batteryInfo.powerConsumption))
                        InfoRow(label: StringConstant.timestamp, value: viewModel.batteryInfo.timestamp)
                    }
                }
                .padding()
                .frame(maxWidth: 320)
                .background(Color.white)
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)

                Spacer()
            }
            .padding()
        }.onAppear {
            self.logPageVisit()
        }
    }

    private var batteryFillWidth: CGFloat {
        let maxWidth: CGFloat = 190
        return maxWidth * CGFloat(viewModel.batteryInfo.batteryPercentage) / 100
    }

    private var batteryColor: Color {
        switch viewModel.batteryInfo.batteryPercentage {
        case 0..<20:
            return .red
        case 20..<50:
            return .orange
        case 50..<80:
            return .yellow
        default:
            return .green
        }
    }
}



#Preview {
    BatteryDetailView(device: DeviceSpecification(
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

