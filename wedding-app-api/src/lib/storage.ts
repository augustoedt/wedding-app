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

  console.log(`[storage] uploading ${key} (${body.length} bytes, ${file.type}) to bucket ${process.env.B2_BUCKET}`)

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.B2_BUCKET!,
        Key: key,
        Body: body,
        ContentType: file.type,
      })
    )
  } catch (e) {
    console.error(`[storage] upload failed for ${key}:`, e)
    throw e
  }

  console.log(`[storage] uploaded ${key}`)
  return `${process.env.B2_PUBLIC_URL}/${key}`
}
