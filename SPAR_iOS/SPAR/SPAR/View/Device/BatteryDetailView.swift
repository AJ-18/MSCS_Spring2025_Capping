//
//  BatteryDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

// MARK: - BatteryDetailView (Main View)
struct BatteryDetailView: View {
    @StateObject private var viewModel: BatteryViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    init(device: DeviceSpecification) {
        _viewModel = StateObject(wrappedValue: BatteryViewModel(device: device))
        self.device = device
    }

    var body: some View {
        LoadingView(isLoading: viewModel.isLoading) {
            ZStack {
                // MARK: Background Gradient
                LinearGradient(colors: [.blue.opacity(0.15), .purple.opacity(0.2)], startPoint: .top, endPoint: .bottom)
                    .ignoresSafeArea()

                VStack {
                    Spacer()

                    // MARK: Card Content
                    BatteryCardView(viewModel: viewModel, device: device)

                    Spacer()
                }
                .padding()
            }
            .onAppear {
                self.logPageVisit()
        }
        }
    }
}

// MARK: - Battery Card View
struct BatteryCardView: View {
    @ObservedObject var viewModel: BatteryViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    var body: some View {
        VStack(spacing: 30) {
            // MARK: Title
            Text(StringConstant.batteryStatus)
                .font(.title)
                .fontWeight(.bold)
                .accessibilityAddTraits(.isHeader)
                .minimumScaleFactor(sizeCategory.customMinScaleFactor)

            // MARK: Battery Visualization
            BatteryGaugeView(percentage: viewModel.batteryInfo.batteryPercentage)

            // MARK: Info Rows
            VStack(alignment: .leading, spacing: 15) {
                InfoRow(label: StringConstant.deviceName, value: device.deviceName)
                InfoRow(label: StringConstant.Charging, value: viewModel.batteryInfo.charging ? StringConstant.batYes : StringConstant.batNo)
                InfoRow(label: StringConstant.power, value: String(format: "%.2f W", viewModel.batteryInfo.powerConsumption))
                InfoRow(label: StringConstant.registeredAt, value: viewModel.batteryInfo.timestamp.toFormattedDate())
            }
        }
        .padding()
        .frame(maxWidth: 320)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
    }
}

// MARK: - Battery Gauge View
struct BatteryGaugeView: View {
    let percentage: Int
    @Environment(\.sizeCategory) var sizeCategory

    private var batteryFillWidth: CGFloat {
        let maxWidth: CGFloat = 190
        return maxWidth * CGFloat(percentage) / 100
    }

    private var batteryColor: Color {
        switch percentage {
        case 0..<20: return .red
        case 20..<50: return .orange
        case 50..<80: return .yellow
        default: return .green
        }
    }

    var body: some View {
        ZStack(alignment: .leading) {
            // Battery Shell
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.gray.opacity(0.3), lineWidth: 2)
                .frame(width: 200, height: 80)
                .background(Color.white.opacity(0.2))
                .clipShape(RoundedRectangle(cornerRadius: 12))

            // Fill Bar
            RoundedRectangle(cornerRadius: 10)
                .fill(batteryColor)
                .frame(width: batteryFillWidth, height: 70)
                .animation(.easeInOut(duration: 0.5), value: percentage)
                .padding(.leading, 5)

            // Percentage Text
            Text("\(percentage)%")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .frame(width: 200, height: 80)
                .background(Color.clear)
                .minimumScaleFactor(sizeCategory.customMinScaleFactor)
        }
    }
}

// MARK: - Preview
#Preview {
    BatteryDetailView(device: DeviceSpecification(
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
