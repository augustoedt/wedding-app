import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const client = new S3Client({
  region: process.env.B2_REGION!,
  endpoint: process.env.B2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
})

export async function uploadImage(key: string, file: File) {
  const body = new Uint8Array(await file.arrayBuffer())

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.B2_BUCKET!,
      Key: key,
      Body: body,
      ContentType: file.type,
    })
  )

  return `${process.env.B2_PUBLIC_URL}/${key}`
}
