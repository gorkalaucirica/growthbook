import { FC } from "react";
import { LicenseMetaData } from "enterprise";
import { FaDownload } from "react-icons/fa";
import { snakeCase } from "lodash";
import { useAuth } from "@/services/auth";
import { useUser } from "@/services/UserContext";
import Button from "../Button";

const DownloadLicenseUsageButton: FC = () => {
  const { apiCall } = useAuth();
  const { organization, license } = useUser();

  const handleDownload = async () => {
    try {
      const res = await apiCall<{
        status: number;
        licenseMetaData: LicenseMetaData;
        userLicenseCodes: string[];
        signature: string;
        timestamp: string;
      }>(`/admin/license-report`, {
        method: "GET",
      });

      if (res.status !== 200) {
        throw new Error("There was an error fetching the license data");
      }

      const blob = new Blob(
        [
          JSON.stringify(
            {
              license: license,
              licenseMetaData: res.licenseMetaData,
              userLicenseCodes: res.userLicenseCodes,
              seatsUsed: res.userLicenseCodes.length,
              signature: res.signature,
              timestamp: res.timestamp,
            },
            null,
            2
          ),
        ],
        {
          type: "application/json",
        }
      );
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `${snakeCase(organization.name)}_license_report.json`;
      link.click();
      window.URL.revokeObjectURL(href);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button onClick={handleDownload}>
        <FaDownload /> Download License Report
      </Button>
    </>
  );
};

export default DownloadLicenseUsageButton;
