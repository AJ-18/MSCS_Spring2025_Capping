//
//  ProcessDetailPage.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI
import Charts

import SwiftUI
import Charts

struct ProcessDetailPage: View {
    @ObservedObject private var viewModel: ProcessViewModel
    let device: DeviceSpecification
    @Environment(\.sizeCategory) var sizeCategory

    init(device: DeviceSpecification) {
        let viewModel = ProcessViewModel(device: device)
        self.viewModel = viewModel
        self.device = device
    }

    @State private var showCPU = true
    @State private var processDisplayLimit = 5

    private var sortedByMetric: [ProcessStatus] {
        viewModel.processList.sorted {
            showCPU ? $0.cpuUsage > $1.cpuUsage : $0.memoryMB > $1.memoryMB
        }
    }

    private var canShowMore: Bool {
        processDisplayLimit < sortedByMetric.count
    }

    private var canShowLess: Bool {
        processDisplayLimit > 5
    }

    var body: some View {
        LoadingView(isLoading: viewModel.isLoading) {
            ScrollView {
                VStack(spacing: 20) {
                    Text(StringConstant.processMonitor)
                        .font(.largeTitle)
                        .bold()
                        .padding(.top)
                        .minimumScaleFactor(sizeCategory.customMinScaleFactor)

                    ProcessMetricPicker(showCPU: $showCPU)

                    ProcessChartView(processes: Array(sortedByMetric.prefix(5)), showCPU: showCPU)

                    ForEach(sortedByMetric.prefix(processDisplayLimit)) { process in
                        ProcessCardView(process: process)
                    }

                    ActionButtonsView(
                        canShowMore: canShowMore,
                        canShowLess: canShowLess,
                        onSeeMore: {
                            withAnimation { processDisplayLimit += 5 }
                        },
                        onSeeLess: {
                            withAnimation { processDisplayLimit = max(5, processDisplayLimit - 5) }
                        }
                    )

                    Spacer(minLength: 40)
                }
            }
            .onAppear { self.logPageVisit() }
            .background(Color(.systemGroupedBackground).ignoresSafeArea())
        }
    }
}

// MARK: - ProcessMetricPicker

struct ProcessMetricPicker: View {
    @Binding var showCPU: Bool

    var body: some View {
        Picker(StringConstant.metric, selection: $showCPU) {
            Text(StringConstant.cpuUsage).tag(true)
            Text(StringConstant.memoryUsage).tag(false)
        }
        .pickerStyle(.segmented)
        .padding(.horizontal)
        .accessibilityLabel(AccessibilityConstant.metricPicker)
    }
}

// MARK: - ProcessChartView

struct ProcessChartView: View {
    let processes: [ProcessStatus]
    let showCPU: Bool

    var body: some View {
        Chart {
            ForEach(processes) { process in
                BarMark(
                    x: .value("Process", "\(process.name) (\(process.pid))"),
                    y: .value(showCPU ? StringConstant.cpu : StringConstant.memory,
                              showCPU ? process.cpuUsage : process.memoryMB)
                )
                .foregroundStyle(showCPU ? Color.blue : Color.green)
                .annotation(position: .top) {
                    Text(String(format: "%.1f", showCPU ? process.cpuUsage : process.memoryMB))
                        .font(.caption)
                        .foregroundColor(.gray)
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel("\(process.name), process id \(process.pid)")
                        .accessibilityValue(showCPU
                            ? String(format: "%.1f percent CPU usage", process.cpuUsage)
                            : String(format: "%.1f megabytes memory usage", process.memoryMB))
                        .accessibilityHint(AccessibilityConstant.processtip1)
                }
            }
        }
        .frame(height: 300)
        .padding(.horizontal)
    }
}

// MARK: - ProcessCardView

struct ProcessCardView: View {
    let process: ProcessStatus

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("PID: \(process.pid)").font(.headline)
                Spacer()
                Text(process.name).fontWeight(.semibold)
            }

            HStack {
                Label(String(format: "%.1f%% CPU", process.cpuUsage), systemImage: ImageConstant.cpu)
                Spacer()
                Label(String(format: "%.1f MB", process.memoryMB), systemImage: ImageConstant.memorychip)
            }
            .font(.subheadline)
            .foregroundColor(.gray)

            Text("Timestamp: \(process.timestamp.toFormattedDate())")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        .padding(.horizontal)
        .transition(.opacity)
    }
}

// MARK: - ActionButtonsView

struct ActionButtonsView: View {
    let canShowMore: Bool
    let canShowLess: Bool
    let onSeeMore: () -> Void
    let onSeeLess: () -> Void

    var body: some View {
        if canShowMore || canShowLess {
            HStack(spacing: 20) {
                if canShowMore {
                    GradientButton(label: "See More", icon: "plus", action: onSeeMore)
                        .accessibilityLabel("See more processes")
                }
                if canShowLess {
                    GradientButton(label: "See Less", icon: "arrow.up", action: onSeeLess)
                        .accessibilityLabel("See fewer processes")
                }
            }
            .padding(.top, 10)
        }
    }
}

// MARK: - GradientButton

struct GradientButton: View {
    let label: String
    let icon: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                Text(label)
            }
            .font(.subheadline.bold())
            .padding(.vertical, 10)
            .padding(.horizontal, 20)
            .background(
                LinearGradient(gradient: Gradient(colors: [Color.accentColor, Color.accentColor.opacity(0.8)]),
                               startPoint: .topLeading,
                               endPoint: .bottomTrailing)
            )
            .foregroundColor(.white)
            .cornerRadius(10)
            .shadow(color: .accentColor.opacity(0.25), radius: 5, x: 0, y: 3)
        }
    }
}


#Preview {
    ProcessDetailPage(device: DeviceSpecification(
        id: 1,
        deviceId: "preview",
        deviceName: "Preview Device",
        manufacturer: "Preview Inc.",
        model: "Model X",
        processor: "Apple M1",
        cpuPhysicalCores: 4,
        cpuLogicalCores: 8,
        installedRam: 16.0,
        graphics: "Integrated",
        operatingSystem: "macOS",
        systemType: "ARM64",
        registeredAt: "2025-04-01T12:00:00Z"
    ))
}
