'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Container,
  Title,
  Stack,
  Paper,
  Text,
  Group,
  Button,
  Textarea,
  Image,
  Loader,
  Center,
  Alert,
  Divider,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { MainLayout } from '@/components/layout'
import { RatingInput } from '@/components/record'
import { useRecord, useUpdateRecord, useDeleteRecord, useRecipe } from '@/lib/hooks'
import { getGenreLabel, getDifficultyLabel, RECIPE_PLACEHOLDER_IMAGE } from '@/lib/utils/recipe'

// 編集フォーム（record の切り替え時に key で再マウントして初期化）
const RecordEditSection = ({
  initialRating,
  initialMemo,
  onSave,
  isUpdating,
}: {
  initialRating: number
  initialMemo: string
  onSave: (data: { rating: number; memo: string }) => void
  isUpdating: boolean
}) => {
  const [rating, setRating] = useState<number>(initialRating)
  const [memo, setMemo] = useState<string>(initialMemo)

  return (
    <>
      {/* 評価 */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Text fw={500}>⭐ 評価</Text>
          <RatingInput value={rating} onChange={setRating} />
        </Stack>
      </Paper>

      {/* メモ */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Text fw={500}>📝 メモ</Text>
          <Textarea
            placeholder="調理時の気づきやコツを入力..."
            minRows={4}
            value={memo}
            onChange={(e) => setMemo(e.currentTarget.value)}
          />
        </Stack>
      </Paper>

      {/* 保存ボタン */}
      <Button size="lg" onClick={() => onSave({ rating, memo })} loading={isUpdating}>
        保存
      </Button>
    </>
  )
}

const RecordDetailPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordId = Number(searchParams.get('id'))

  // データ取得
  const { data: record, isLoading, error } = useRecord(recordId)
  const { data: recipe } = useRecipe(record?.recipeId || 0, {
    enabled: !!record?.recipeId, // recipeIdが存在する場合のみクエリを実行
  })

  // 更新・削除
  const { mutate: updateRecord, isPending: isUpdating } = useUpdateRecord()
  const { mutate: deleteRecord, isPending: isDeleting } = useDeleteRecord()

  // 保存
  const handleSave = ({ rating, memo }: { rating: number; memo: string }) => {
    updateRecord(
      {
        id: recordId,
        data: {
          // rating=0 の場合は null として送信して評価をクリア
          rating: rating > 0 ? rating : null,
          memo,
        },
      },
      {
        onSuccess: () => {
          router.push('/records')
        },
        onError: () => {
          alert('保存に失敗しました')
        },
      },
    )
  }

  // 削除
  const handleDelete = () => {
    modals.openConfirmModal({
      title: '調理記録を削除',
      children: <Text size="sm">この記録を削除しますか？この操作は取り消せません。</Text>,
      labels: { confirm: '削除する', cancel: 'キャンセル' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteRecord(recordId, {
          onSuccess: () => {
            router.push('/records')
          },
          onError: () => {
            alert('削除に失敗しました')
          },
        })
      },
    })
  }

  // IDが無効な場合
  if (!recordId || isNaN(recordId)) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Alert
            icon={<ExclamationTriangleIcon style={{ width: 20, height: 20 }} />}
            title="エラー"
            color="red"
          >
            無効な記録IDです。
          </Alert>
          <Group justify="center" mt="xl">
            <Button onClick={() => router.push('/records')}>調理記録一覧に戻る</Button>
          </Group>
        </Container>
      </MainLayout>
    )
  }

  // ローディング
  if (isLoading) {
    return (
      <MainLayout>
        <Center h="50vh">
          <Loader size="xl" />
        </Center>
      </MainLayout>
    )
  }

  // エラー
  if (error || !record) {
    return (
      <MainLayout>
        <Container size="md" mt="xl">
          <Alert
            icon={<ExclamationTriangleIcon style={{ width: 20, height: 20 }} />}
            title="エラー"
            color="red"
          >
            調理記録の取得に失敗しました
          </Alert>
          <Group justify="center" mt="xl">
            <Button onClick={() => router.push('/')}>トップに戻る</Button>
          </Group>
        </Container>
      </MainLayout>
    )
  }

  const formattedDate = new Date(record.cookedAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <MainLayout>
      <Container size="md" mt="xl">
        <Stack gap="xl">
          <Title order={1}>調理記録</Title>

          {/* レシピ情報 */}
          {recipe && (
            <Paper withBorder p="md" radius="md">
              <Stack gap="md">
                <Text fw={500} size="lg">
                  📖 レシピ情報
                </Text>

                <Image
                  src={recipe.imageUrl || RECIPE_PLACEHOLDER_IMAGE}
                  height={200}
                  radius="md"
                  alt={recipe.title}
                />

                <div>
                  <Text fw={500} size="lg">
                    {recipe.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {getGenreLabel(recipe.genre)} / {getDifficultyLabel(recipe.difficulty)}
                  </Text>
                </div>

                <Button
                  variant="light"
                  onClick={() => router.push(`/recipes?id=${recipe.id}&from=record`)}
                >
                  レシピ詳細を見る
                </Button>
              </Stack>
            </Paper>
          )}

          {/* 編集フォーム（record.id を key にして変更時に再マウント） */}
          <RecordEditSection
            key={record.id}
            initialRating={record?.rating ?? 0}
            initialMemo={record?.memo ?? ''}
            onSave={handleSave}
            isUpdating={isUpdating}
          />

          <Divider />

          {/* 調理情報 */}
          <Paper withBorder p="md" radius="md">
            <Stack gap="md">
              <Text fw={500}>⏰ 調理日時</Text>
              <Text>{formattedDate}</Text>
            </Stack>
          </Paper>

          {/* アクションボタン */}
          <Group justify="space-between">
            <Button variant="outline" onClick={() => router.push('/records')}>
              一覧に戻る
            </Button>

            <Button color="red" variant="light" onClick={handleDelete} loading={isDeleting}>
              この記録を削除
            </Button>
          </Group>
        </Stack>
      </Container>
    </MainLayout>
  )
}

export default RecordDetailPage