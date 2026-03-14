import os

base_dir = "/Users/virul/Dev/makabasla-v2/backend-services"
services = ["api-gateway", "appointment-service", "billing-service", "iam-service", "task-mgt-service", "webstore-service"]

for s in services:
    df_path = os.path.join(base_dir, s, "Dockerfile")
    if os.path.exists(df_path):
        with open(df_path, "r") as f:
            content = f.read()
        
        if "apk add --no-cache git" not in content:
            new_content = content.replace("RUN go mod tidy", "RUN apk add --no-cache git\nRUN go mod tidy")
            with open(df_path, "w") as f:
                f.write(new_content)
        print(f"Updated {s}")
