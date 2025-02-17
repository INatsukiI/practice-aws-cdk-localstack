import boto3
import os
import json

# LocalStack用のエンドポイント設定
sns = boto3.client('sns', endpoint_url='http://localhost:4566')

def create_html_message(bucket: str, key: str, size: str, event_time: str) -> str:
    return f"""
    <html>
        <body>
            <h1>新しいファイルがアップロードされました</h1>
            <p>以下のファイルがS3バケットにアップロードされました：</p>
            <ul>
                <li><strong>バケット名:</strong> {bucket}</li>
                <li><strong>ファイル名:</strong> {key}</li>
                <li><strong>サイズ:</strong> {size} bytes</li>
                <li><strong>アップロード時間:</strong> {event_time}</li>
            </ul>
        </body>
    </html>
    """

def create_plain_text_message(bucket: str, key: str, size: str, event_time: str) -> str:
    return f"""
    新しいファイルがアップロードされました

    バケット名: {bucket}
    ファイル名: {key}
    サイズ: {size} bytes
    アップロード時間: {event_time}
    """

def create_message_body(bucket: str, key: str, size: str, event_time: str) -> dict:
    html_message = create_html_message(bucket, key, size, event_time)
    plain_text = create_plain_text_message(bucket, key, size, event_time)
    
    return {
        "default": plain_text,
        "email": plain_text,
        "email-json": plain_text,
        "email-html": html_message
    }

def handler(event, context):
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
        size = event['Records'][0]['s3']['object'].get('size', 'unknown')
        event_time = event['Records'][0]['eventTime']
        message = create_message_body(bucket, key, size, event_time)

        response = sns.publish(
            TopicArn=os.environ['TOPIC_ARN'],
            Subject='新しいファイルのアップロード通知',
            Message=json.dumps(message),
            MessageStructure='json'
        )

        print(f'通知を送信しました: {bucket}/{key}')
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Notification sent successfully',
                'messageId': response['MessageId']
            })
        }

    except Exception as e:
        print(f'エラーが発生しました: {str(e)}')
        raise e