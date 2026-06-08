import { writeMobileUsabilityReports } from "./mobile-usability-report";

export default function globalTeardown() {
  writeMobileUsabilityReports();
}
