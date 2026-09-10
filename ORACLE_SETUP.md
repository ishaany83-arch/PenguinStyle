# Oracle Cloud Setup Guide for PenguinStyle

## Prerequisites
- Oracle Cloud free tier account (https://www.oracle.com/cloud/free/)
- Docker installed locally
- Docker Hub account (free tier at https://hub.docker.com)
- SSH key for Oracle Cloud instance

---

## Step 1: Create Oracle Cloud Compute Instance

### 1.1 Log into Oracle Cloud Console
- Go to https://cloud.oracle.com/
- Navigate to **Compute → Instances**

### 1.2 Create Instance
- Click **Create Instance**
- **Image**: Ubuntu 22.04 (or Oracle Linux 8)
- **Shape**: Ampere (ARM) - Free Eligible ✅
- **Public IP**: Assign
- **Key pair**: Download and save your SSH private key
- Click **Create**

### 1.3 Wait for Instance to Start
- Note your **Public IP Address** (e.g., 123.45.67.89)
- Instance status should be "Running"

---

## Step 2: Open Security List (Firewall)

### 2.1 Configure VCN Security List
- In Oracle Cloud Console, go to **Networking → Virtual Cloud Networks**
- Find your VCN
- Click on **Security Lists → Default Security List**
- Click **Add Ingress Rule**
  - **Source CIDR**: 0.0.0.0/0
  - **Destination Port Range**: 3000
  - **Protocol**: TCP
- Click **Add Ingress Rule**

---

## Step 3: SSH into Your Instance

```bash
# Change permissions on private key
chmod 600 /path/to/oracle_key

# SSH into instance
ssh -i /path/to/oracle_key ubuntu@YOUR_INSTANCE_IP
```

Replace:
- `/path/to/oracle_key` → Path to your downloaded SSH key
- `YOUR_INSTANCE_IP` → Your instance's public IP

---

## Step 4: Install Docker on Oracle Instance

Once SSH'd into the instance, run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

# Log out and back in for group change to take effect
exit
```

Log back in:
```bash
ssh -i /path/to/oracle_key ubuntu@YOUR_INSTANCE_IP
```

---

## Step 5: Deploy to Oracle Cloud

### 5.1 Create Docker Hub Account
- Sign up at https://hub.docker.com (free)
- Create a repository named `penguin-style`

### 5.2 Run Deployment Script Locally

```bash
bash oracle-deploy.sh YOUR_DOCKER_USERNAME YOUR_DOCKER_PASSWORD YOUR_INSTANCE_IP
```

Example:
```bash
bash oracle-deploy.sh john mypassword 123.45.67.89
```

**What the script does:**
1. Builds Docker image locally
2. Pushes to Docker Hub
3. SSH's into Oracle instance
4. Pulls image and starts container
5. Configures environment variables

---

## Step 6: Verify Deployment

### 6.1 Check if Container is Running

```bash
# SSH into instance
ssh -i /path/to/oracle_key ubuntu@YOUR_INSTANCE_IP

# Check running containers
docker ps

# View logs
docker logs penguin-style
```

### 6.2 Test Your App

Open in browser:
```
http://YOUR_INSTANCE_IP:3000/status
```

Should return:
```json
{
  "status": "ok",
  "uptime": 1234.56,
  "timestamp": "2026-09-10T23:41:21.789Z",
  "environment": "production"
}
```

---

## Step 7: Connect Frontend to Backend

Update your `public/index.html` or `public/config.js`:

```javascript
const API_URL = 'http://YOUR_INSTANCE_IP:3000';
const proxyUrl = API_URL + '/game-tunnel?url=' + encodeURIComponent(targetUrl);
```

Or with HTTPS (if you set up a domain):
```javascript
const API_URL = 'https://your-domain.com';
```

---

## Useful Commands

### SSH into instance
```bash
ssh -i /path/to/oracle_key ubuntu@YOUR_INSTANCE_IP
```

### View logs
```bash
docker logs -f penguin-style
```

### Stop/restart container
```bash
docker stop penguin-style
docker start penguin-style
```

### Redeploy updated code
```bash
bash oracle-deploy.sh YOUR_DOCKER_USERNAME YOUR_DOCKER_PASSWORD YOUR_INSTANCE_IP
```

### SSH into running container
```bash
docker exec -it penguin-style sh
```

---

## Troubleshooting

### App won't start
```bash
docker logs penguin-style
# Check for errors in logs
```

### Can't SSH into instance
- Verify instance public IP is correct
- Check key permissions: `chmod 600 /path/to/oracle_key`
- Verify security list allows port 22 (SSH)

### Port 3000 not accessible
- Add ingress rule in Security List for port 3000 TCP
- Wait ~2 minutes for rule to take effect
- Check firewall on instance: `sudo iptables -L`

### Docker permission denied
```bash
# Add user to docker group and log out/in
sudo usermod -aG docker $USER
exit
# Log back in
```

### Out of memory
- Oracle free tier has limited RAM
- Monitor: `docker stats`
- Upgrade instance shape if needed

---

## Next Steps

1. ✅ Create Oracle Compute Instance
2. ✅ Open port 3000 in Security List
3. ✅ SSH and install Docker
4. ✅ Run `oracle-deploy.sh`
5. ✅ Test at `http://YOUR_IP:3000/status`
6. ✅ Update frontend to use your Oracle IP
7. (Optional) Set up domain with HTTPS

**Your app will use Oracle Cloud's 1TB/month free bandwidth!** 🚀
