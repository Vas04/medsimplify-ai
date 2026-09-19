import axios from "axios";
import {
  demoHistoryTests,
  demoReport,
  demoReports,
  demoTestNames,
} from "../data/demoReport";

// Demo mode must be explicitly enabled.
// Real backend mode is the default so uploaded files are actually processed.
const DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === "true";

const http = axios.create({
  baseURL: "http://localhost:5000/api",
});

const demoDelay = (ms = 250) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const demoResponse = async (data) => {
  await demoDelay();
  return { data };
};

const api = {
  get: async (url) => {
    if (!DEMO_MODE) {
      return http.get(url);
    }

    if (url === "/reports") {
      return demoResponse({
        success: true,
        reports: demoReports,
      });
    }

    if (url === "/history/tests") {
      return demoResponse({
        success: true,
        tests: demoHistoryTests,
      });
    }

    if (url === "/history/test-names") {
      return demoResponse({
        success: true,
        testNames: demoTestNames,
      });
    }

    if (url.startsWith("/reports/")) {
      return demoResponse({
        success: true,
        report: demoReport.report,
        tests: demoReport.tests,
      });
    }

    throw new Error(
      `Demo endpoint not implemented: ${url}`
    );
  },

  delete: async (url) => {
    if (!DEMO_MODE) {
      return http.delete(url);
    }

    await demoDelay();

    return {
      data: {
        success: true,
        message:
          "Demo report removed from the current session.",
      },
    };
  },

  post: async (url, body) => {
    if (!DEMO_MODE) {
      return http.post(url, body);
    }

    if (url === "/reports/upload") {
      await demoDelay(900);

      return {
        data: {
          success: true,
          rejected: false,
          message:
            "Demo report analyzed without using an AI API.",
          report: demoReport.report,
          analysis: {
            reportType:
              demoReport.report.report_type,
            reportDate:
              demoReport.report.report_date,
            summary: demoReport.summary,
            tests: demoReport.tests.map(
              (test) => ({
                testName:
                  test.test_name,
                value: test.value,
                displayValue:
                  test.display_value,
                unit: test.unit,
                referenceMin:
                  test.reference_min,
                referenceMax:
                  test.reference_max,
                referenceText:
                  test.reference_text,
                status: test.status,
                explanation:
                  test.explanation,
              })
            ),
          },
        },
      };
    }

    throw new Error(
      `Demo endpoint not implemented: ${url}`
    );
  },
};

export const isDemoMode = DEMO_MODE;

export const uploadReport = async (file) => {
  const formData = new FormData();
  formData.append("report", file);

  const response = await api.post(
    "/reports/upload",
    formData
  );

  return response.data;
};

export default api;
