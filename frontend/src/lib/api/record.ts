import { apiClient } from '@/lib/api/client'
import type {
  Record,
  CreateRecordRequest,
  UpdateRecordRequest,
  RecordsListResponse,
  RecordQueryParams,
} from '@/types/record'

/**
 * 調理記録を作成
 */
export const createRecord = async (data: CreateRecordRequest): Promise<Record> => {
  const response = await apiClient.post<Record>('/records', data)
  return response.data
}

/**
 * 調理記録一覧を取得
 */
export const getRecords = async (params?: RecordQueryParams): Promise<RecordsListResponse> => {
  const response = await apiClient.get<RecordsListResponse>('/records', { params })
  return response.data
}

/**
 * 調理記録詳細を取得
 */
export const getRecord = async (id: number): Promise<Record> => {
  const response = await apiClient.get<Record>(`/records/${id}`)
  return response.data
}

/**
 * 調理記録を更新
 */
export const updateRecord = async (id: number, data: UpdateRecordRequest): Promise<Record> => {
  const response = await apiClient.patch<Record>(`/records/${id}`, data)
  return response.data
}

/**
 * 調理記録を削除
 */
export const deleteRecord = async (id: number): Promise<void> => {
  await apiClient.delete(`/records/${id}`)
}
