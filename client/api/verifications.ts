import { TApiResponse } from "@/types";
import CallApi from "@/utils/call-api";
import { VERIFICATION_ENDPOINTS } from "@/enum";

import {
  IListingPreview,
  IVerificationResponse,
} from "@/interface";

export interface TVerifyListingPayload {
  source: "url" | "manual";
  listingUrl?: string;
  listingContext?: string;
  address: string;
  price?: number;
  agentName?: string;
  agentPhone: string;
}

class VerificationApi {
  static async create(payload: TVerifyListingPayload) {
    const res = await CallApi<TApiResponse<IVerificationResponse>>(
      VERIFICATION_ENDPOINTS.ROOT,
      "POST",
      "json",
      payload,
    );

    if (res.status === "error") {
      return { message: res.message };
    }

    return { data: res.data, message: res.message };
  }

  static async get(id: string) {
    const res = await CallApi<TApiResponse<IVerificationResponse>>(
      `${VERIFICATION_ENDPOINTS.ROOT}/${id}`,
      "GET",
    );

    if (res.status === "error") {
      return { message: res.message };
    }

    return { data: res.data, message: res.message };
  }

  static async list() {
    const res = await CallApi<TApiResponse<IVerificationResponse[]>>(
      VERIFICATION_ENDPOINTS.ROOT,
      "GET",
    );

    if (res.status === "error") {
      return { message: res.message };
    }

    return { data: res.data, message: res.message };
  }

  static async parse(url: string) {
    const res = await CallApi<TApiResponse<IListingPreview>>(
      VERIFICATION_ENDPOINTS.PARSE,
      "POST",
      "json",
      { url },
    );

    if (res.status === "error") {
      return { message: res.message };
    }

    return { data: res.data, message: res.message };
  }
}

export default VerificationApi;