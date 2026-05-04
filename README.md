# QueueLess

Our mission is to provide a cost-effective and agile system that prioritizes customer satisfaction. By integrating technology into daily workflows, we aim to reduce expenses and save time for both owners and customers.

## Final Assignment FSE Requirements

### Team Members
- Ibrahim Atasoy
- (Add your other team members here)

### Deployed Application URL
[Queueless on Fly.io](https://queueless.fly.dev) *(Replace this link with your actual deployment URL if different)*

### Key Features
- **Online Queue Registration:** Customers can join a line from their mobile devices without being physically present.
- **Real-time Position Tracking:** Users can see their exact place in the queue and estimated waiting times.
- **Smart Inventory Management:** Business owners can track stock levels and set items as "out-of-stock".
- **VIP & Urgent Prioritization:** Owners can prioritize specific cases to handle urgent or VIP customers first.
- **Secure Authentication:** User data is protected through a secure login mechanism.

### Technical Stack
- **Frontend:** Flutter (Web & Mobile)
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Containerization:** Docker, Docker Compose
- **Deployment:** Fly.io
- **CI/CD:** GitHub Actions (Node.js tests, Flutter analyze & test)

### Local Setup Instructions

#### Using Docker Compose (Recommended)
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop).
2. Clone the repository.
3. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
4. The backend will be available at `http://localhost:3000` and the MySQL database will be running on port `3306`.

#### Manual Setup
1. **Database:** Ensure you have MySQL running. Create a database named `queueless`.
2. **Backend:**
   ```bash
   cd backend
   npm install
   npm run setup-db
   npm run dev
   ```
3. **Frontend:**
   ```bash
   cd queueless
   flutter pub get
   flutter run -d chrome
   ```

### Running Tests
To run the backend tests and collect coverage:
```bash
cd backend
npm run test
```
To run the frontend tests:
```bash
cd queueless
flutter test --coverage
```
