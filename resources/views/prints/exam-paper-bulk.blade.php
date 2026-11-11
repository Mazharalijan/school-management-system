<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bulk Print Exam Papers</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: "Times New Roman", Times, Georgia, serif;
            color: #111827;
            background: #f3f4f6;
            line-height: 1.4;
        }
        .no-print-bar {
            background: #0f172a;
            color: #ffffff;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 50;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            border: none;
        }
        .btn-primary {
            background: #059669;
            color: #ffffff;
        }
        .btn-primary:hover {
            background: #047857;
        }
        .btn-secondary {
            background: #334155;
            color: #f1f5f9;
        }
        .btn-secondary:hover {
            background: #475569;
        }
        .paper-container {
            max-width: 800px;
            margin: 24px auto;
            background: #ffffff;
            padding: 40px 48px;
            border: 1px solid #d1d5db;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            page-break-after: always;
            break-after: page;
        }
        .paper-container:last-child {
            page-break-after: auto;
            break-after: auto;
        }
        .header {
            border-bottom: 2px solid #000000;
            padding-bottom: 12px;
            margin-bottom: 16px;
            text-align: center;
        }
        .school-title {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .school-subtitle {
            font-size: 12px;
            font-style: italic;
            font-family: system-ui, sans-serif;
            color: #4b5563;
            margin-top: 2px;
        }
        .exam-title {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 8px;
            letter-spacing: 0.5px;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            border-top: 1px solid #000000;
            border-bottom: 1px solid #000000;
            padding: 6px 0;
            margin-top: 10px;
            font-family: system-ui, sans-serif;
            font-size: 12px;
            font-weight: bold;
        }
        .student-fields {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 16px;
            padding: 10px 0;
            font-family: system-ui, sans-serif;
            font-size: 12px;
            border-bottom: 1px dashed #9ca3af;
            margin-bottom: 14px;
        }
        .fill-line {
            display: inline-block;
            border-bottom: 1px solid #000000;
            min-width: 120px;
            height: 16px;
        }
        .instructions-box {
            background: #f9fafb;
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            font-size: 12px;
            font-family: system-ui, sans-serif;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .instructions-box strong {
            display: block;
            margin-bottom: 4px;
            text-transform: uppercase;
        }
        .section-header {
            text-align: center;
            border-bottom: 1px solid #000000;
            padding-bottom: 4px;
            margin: 20px 0 14px 0;
            break-inside: avoid;
        }
        .section-header h3 {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .section-header p {
            font-size: 12px;
            font-style: italic;
        }
        .question-item {
            margin-bottom: 16px;
            font-size: 14px;
            break-inside: avoid;
        }
        .question-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
        }
        .question-text {
            flex: 1;
        }
        .question-marks {
            font-family: system-ui, sans-serif;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
        }

        @media print {
            @page {
                size: A4 portrait;
                margin: 15mm 15mm 15mm 15mm;
            }
            body {
                background: #ffffff !important;
                color: #000000 !important;
            }
            .no-print-bar {
                display: none !important;
            }
            .paper-container {
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
            }
            .instructions-box {
                background: transparent !important;
                border-color: #6b7280 !important;
            }
        }
    </style>
</head>
<body>

    <div class="no-print-bar">
        <div>
            <strong>Bulk Paper Printing</strong> &bull; Total Papers: {{ count($papers) }}
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="btn btn-primary">Print All ({{ count($papers) }})</button>
            <button onclick="window.history.back()" class="btn btn-secondary">Back</button>
        </div>
    </div>

    @foreach($papers as $paper)
        <div class="paper-container">
            <div class="header">
                <div class="school-title">{{ config('app.name', 'Academic Excellence High School') }}</div>
                <div class="school-subtitle">Excellence in Knowledge, Character & Leadership</div>
                <div class="exam-title">{{ $paper->paper_title }}</div>

                <div class="meta-grid">
                    <div>Class: {{ $paper->schoolClass?->name ?? 'N/A' }}</div>
                    <div>Subject: {{ $paper->subject?->subject_name ?? 'N/A' }}</div>
                    <div>Time: {{ $paper->duration_minutes ?? 180 }} Mins</div>
                    <div style="text-align: right;">Total Marks: {{ (int) $paper->total_marks }}</div>
                </div>
            </div>

            <div class="student-fields">
                <div>Student Name: <span class="fill-line" style="min-width: 200px;"></span></div>
                <div>Roll No: <span class="fill-line" style="min-width: 80px;"></span></div>
                <div>Section: <span class="fill-line" style="min-width: 60px;"></span></div>
            </div>

            @if($paper->instructions)
                <div class="instructions-box">
                    <strong>General Instructions:</strong>
                    <div>{!! nl2br(e($paper->instructions)) !!}</div>
                </div>
            @endif

            <div class="sections-container">
                @foreach($paper->sections as $sIndex => $section)
                    <div class="section-header">
                        <h3>SECTION {{ $section->section_name }}</h3>
                        @if($section->title)
                            <p>({{ $section->title }}) &bull; [Max Marks: {{ (int) $section->total_marks }}]</p>
                        @endif
                    </div>

                    <div class="questions-list">
                        @foreach($section->questions as $qIndex => $qItem)
                            @php
                                $qBank = $qItem->questionBank;
                            @endphp
                            <div class="question-item">
                                <div class="question-row">
                                    <div class="question-text">
                                        <strong>Q{{ $qIndex + 1 }}.</strong> {{ $qBank?->question ?? 'Question content' }}
                                    </div>
                                    <div class="question-marks">
                                        [{{ (int) $qItem->marks }} Marks]
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endforeach
            </div>
        </div>
    @endforeach

</body>
</html>
