//     <style>
//       /* Users Page Specific Styles */
//       .users-container {
//         padding: 20px;
//         overflow-y: auto;
//         flex: 1;
//       }

//       .users-header {
//         display: flex;
//         flex-direction: column;
//         margin-bottom: 20px;
//       }

//       .users-header h1 {
//         margin-bottom: 20px;
//       }

//       .users-actions {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         flex-wrap: wrap;
//         gap: 15px;
//         margin-bottom: 20px;
//       }

//       .search-box {
//         display: flex;
//         align-items: center;
//         background-color: var(--card-bg);
//         border-radius: 5px;
//         padding: 5px 10px;
//         width: 300px;
//       }

//       .search-box input {
//         background: none;
//         border: none;
//         color: var(--text-color);
//         padding: 8px;
//         width: 100%;
//         outline: none;
//       }

//       .sort-options {
//         display: flex;
//         align-items: center;
//         gap: 10px;
//       }

//       .sort-options label {
//         color: var(--text-muted);
//       }

//       .sort-options select {
//         background-color: var(--card-bg);
//         border: 1px solid var(--border-color);
//         color: var(--text-color);
//         padding: 8px 12px;
//         border-radius: 5px;
//         outline: none;
//         cursor: pointer;
//       }

//       .users-table-container {
//         background-color: var(--card-bg);
//         border-radius: 10px;
//         overflow: hidden;
//         box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//         margin-bottom: 20px;
//       }

//       .users-table {
//         width: 100%;
//         border-collapse: collapse;
//         min-width: 800px;
//       }

//       .users-table th,
//       .users-table td {
//         padding: 15px;
//         text-align: left;
//         border-bottom: 1px solid var(--border-color);
//       }

//       .users-table th {
//         background-color: rgba(255, 140, 0, 0.1);
//         color: var(--primary-color);
//         font-weight: 600;
//         position: sticky;
//         top: 0;
//         z-index: 10;
//       }

//       .users-table tbody tr:hover {
//         background-color: rgba(255, 140, 0, 0.05);
//       }

//       .users-table tbody tr:last-child td {
//         border-bottom: none;
//       }

//       .user-status {
//         display: inline-block;
//         padding: 5px 10px;
//         border-radius: 20px;
//         font-size: 12px;
//         font-weight: 600;
//       }

//       .status-active {
//         background-color: rgba(72, 187, 120, 0.2);
//         color: var(--success-color);
//       }

//       .status-blocked {
//         background-color: rgba(245, 101, 101, 0.2);
//         color: var(--danger-color);
//       }

//       .action-buttons {
//         display: flex;
//         gap: 10px;
//       }

//       .block-btn,
//       .unblock-btn {
//         padding: 6px 12px;
//         border: none;
//         border-radius: 5px;
//         cursor: pointer;
//         font-weight: 600;
//         display: flex;
//         align-items: center;
//         gap: 5px;
//         transition: all 0.3s ease;
//       }

//       .block-btn {
//         background-color: rgba(245, 101, 101, 0.2);
//         color: var(--danger-color);
//       }

//       .block-btn:hover {
//         background-color: var(--danger-color);
//         color: white;
//       }

//       .unblock-btn {
//         background-color: rgba(72, 187, 120, 0.2);
//         color: var(--success-color);
//       }

//       .unblock-btn:hover {
//         background-color: var(--success-color);
//         color: white;
//       }

//       /* Pagination */
//       .pagination {
//         display: flex;
//         justify-content: center;
//         align-items: center;
//         margin-top: 20px;
//         gap: 10px;
//       }

//       .pagination-btn {
//         background-color: var(--card-bg);
//         border: 1px solid var(--border-color);
//         color: var(--text-color);
//         padding: 8px 15px;
//         border-radius: 5px;
//         cursor: pointer;
//         display: flex;
//         align-items: center;
//         gap: 5px;
//         transition: all 0.3s ease;
//       }

//       .pagination-btn:hover:not(:disabled) {
//         background-color: var(--primary-color);
//         color: white;
//       }

//       .pagination-btn:disabled {
//         opacity: 0.5;
//         cursor: not-allowed;
//       }

//       .page-numbers {
//         display: flex;
//         gap: 5px;
//       }

//       .page-number {
//         width: 35px;
//         height: 35px;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         background-color: var(--card-bg);
//         border: 1px solid var(--border-color);
//         color: var(--text-color);
//         border-radius: 5px;
//         cursor: pointer;
//         transition: all 0.3s ease;
//       }

//       .page-number:hover {
//         background-color: rgba(255, 140, 0, 0.1);
//         color: var(--primary-color);
//       }

//       .page-number.active {
//         background-color: var(--primary-color);
//         color: white;
//         border-color: var(--primary-color);
//       }

//       /* Responsive Styles */
//       @media (max-width: 1024px) {
//         .users-actions {
//           flex-direction: column;
//           align-items: flex-start;
//         }

//         .search-box {
//           width: 100%;
//         }

//         .sort-options {
//           width: 100%;
//         }
//       }

//       @media (max-width: 768px) {
//         .users-table-container {
//           overflow-x: auto;
//         }

//         .pagination {
//           flex-wrap: wrap;
//         }
//       }
//     </style>
//         <%-include("../../Views/Partials/Admin/header")%>
//         <!-- Users Content -->
//         <div class="users-container">
//           <div class="users-header">
//             <h1>Users Management</h1>
//             <div class="users-actions">
//               <div class="search-box">
//                 <input
//                   type="text"
//                   id="user-search"
//                   placeholder="Search users..."
//                 />
//                 <button class="search-btn">
//                   <i class="fas fa-search"></i>
//                 </button>
//               </div>
//               <div class="sort-options">
//                 <label for="sort-select">Sort by:</label>
//                 <select id="sort-select">
//                   <option value="newest">Newest First</option>
//                   <option value="oldest">Oldest First</option>
//                   <option value="name-asc">Name (A-Z)</option>
//                   <option value="name-desc">Name (Z-A)</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div class="users-table-container">
//             <table class="users-table">
//               <thead>
//                 <tr>
//                   <th>Sl No</th>
//                   <th>Full Name</th>
//                   <th>Email ID</th>
//                   <th>Mobile</th>
//                   <th>Joined On</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody id="users-table-body">
//                 <!-- User rows will be populated by JavaScript -->
//               </tbody>
//             </table>
//           </div>

//           <div class="pagination">
//             <button id="prev-page" class="pagination-btn" disabled>
//               <i class="fas fa-chevron-left"></i> Previous
//             </button>
//             <div id="page-numbers" class="page-numbers">
//               <button class="page-number active">1</button>
//               <button class="page-number">2</button>
//               <button class="page-number">3</button>
//               <button class="page-number">4</button>
//             </div>
//             <button id="next-page" class="pagination-btn">
//               Next <i class="fas fa-chevron-right"></i>
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>

//     <!-- <script src="script.js"></script> --> 
//     <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
//     <script>
//       document.addEventListener("DOMContentLoaded", function () {
//         // Sample user data
//        let users = <%- JSON.stringify(userdata) %>
//         // console.log("---------",users) // debugging
//         //  user dummy data present here.

//         // Sort users by joined date (newest first)
//         users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//         // Pagination variables
//         let currentPage = 1;
//         const usersPerPage = 5;
//         let filteredUsers = [...users];

//         // Format date function
//         function formatDate(dateString) {
//           const options = { year: "numeric", month: "short", day: "numeric" };
//           return new Date(dateString).toLocaleDateString("en-US", options);
//         }

//         // Render users table
//         function renderUsers() {
//           const tableBody = document.getElementById("users-table-body");
//           tableBody.innerHTML = "";

//           // Calculate pagination
//           const startIndex = (currentPage - 1) * usersPerPage;
//           const endIndex = startIndex + usersPerPage;
//           const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

//           // Render users
//           paginatedUsers.forEach((user, index) => {
//             const row = document.createElement("tr");

//             // Calculate serial number based on current page
//             const slNo = startIndex + index + 1;

//             row.innerHTML = `
//            <td>${slNo}</td>
//            <td>${user.firstName + " " + user.lastName}</td>
//            <td>${user.email}</td>
//            <td>${user.phone}</td>
//            <td>${formatDate(user.createdAt)}</td>
//            <td>
//               <span class="user-status ${user.isBlocked ? "status-blocked" : "status-active"}">
//                 ${user.isBlocked ? "Blocked" : "Active"}
//               </span>  
//            </td>
//                 <td class="action-buttons">
//                  ${
//                     user.isBlocked
//                       ? `<button class="unblock-btn" data-id="${user._id}">
//                         <i class="fas fa-check-circle"></i> Unblock
//                         </button>`
                        
//                       : `<button class="block-btn" data-id="${user._id}">
//                         <i class="fas fa-ban"></i> Block
//                         </button>`
//                   }
//                 </td>`;
//             tableBody.appendChild(row);
//           });

//           // Add event listeners to block/unblock buttons

//           document.querySelectorAll(".block-btn").forEach((btn) => {
//             btn.addEventListener("click", function () {
//               const userId = this.getAttribute("data-id");
//               console.log("Trying to block:", userId); // debugging
//               blockUser(userId);
//             });
//           });

//           document.querySelectorAll(".unblock-btn").forEach((btn) => {
//             btn.addEventListener("click", function () {
//               const userId = this.getAttribute("data-id");
//               console.log("Block clicked for ID:", userId);  // debugging
//               unblockUser(userId);
//             });
//           });

//           // Update pagination
//           updatePagination();
//         }

//         // Update pagination controls
//         function updatePagination() {
//           const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
//           const pageNumbers = document.getElementById("page-numbers");
//           const prevBtn = document.getElementById("prev-page");
//           const nextBtn = document.getElementById("next-page");

//           // Update prev/next buttons
//           prevBtn.disabled = currentPage === 1;
//           nextBtn.disabled = currentPage === totalPages;

//           // Update page numbers
//           pageNumbers.innerHTML = "";

//           // Determine range of page numbers to show
//           let startPage = Math.max(1, currentPage - 2);
//           let endPage = Math.min(totalPages, startPage + 4);

//           // Adjust if we're near the end
//           if (endPage - startPage < 4) {
//             startPage = Math.max(1, endPage - 4);
//           }

//           for (let i = startPage; i <= endPage; i++) {
//             const pageBtn = document.createElement("button");
//             pageBtn.className = `page-number ${i === currentPage ? "active" : ""}`;
//             pageBtn.textContent = i;
//             pageBtn.addEventListener("click", () => {
//               currentPage = i;
//               renderUsers();
//             });
//             pageNumbers.appendChild(pageBtn);
//           }
//         }

//         // Search functionality
//         const searchInput = document.getElementById("user-search");
//         searchInput.addEventListener("input", function () {
//           const searchTerm = this.value.toLowerCase().trim();
//           applyFiltersAndSort(searchTerm);
//         });

//         // Sort functionality
//         const sortSelect = document.getElementById("sort-select");
//         sortSelect.addEventListener("change", function () {
//           applyFiltersAndSort();
//         });
          
//         // Apply filters and sort
//         function applyFiltersAndSort(
//           searchTerm = searchInput.value.toLowerCase().trim()
//         ) {
//             filteredUsers = users.filter((user) => {
//             const fullName = `${user.firstName || ""}${user.lastName || ""}`.toLowerCase();
//             const email = user.email?.toLowerCase() || "";
//             const phone = String(user.phone || ""); 
          
//             return (
//               fullName.includes(searchTerm) ||
//               email.includes(searchTerm) ||
//               phone.includes(searchTerm)
//             );
//           });
           
//           // Sort users
//           const sortOption = sortSelect.value;
//           switch (sortOption) {
//             case "newest":
//               filteredUsers.sort(
//                 (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//               );
//               break;
//             case "oldest":
//               filteredUsers.sort(
//                 (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
//               );
//               break;
//             case "name-asc":
//                filteredUsers.sort((a, b) =>
//                  (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)
//               );
//                break;
//             case "name-desc":
//                filteredUsers.sort((a, b) =>
//                  (b.firstName + b.lastName).localeCompare(a.firstName + a.lastName)
//                );
//               break;
//              }

//           // Reset to first page when filtering
//           currentPage = 1;
//           renderUsers();
//         }

//         // Pagination event listeners
//         document
//           .getElementById("prev-page")
//           .addEventListener("click", function () {
//             if (currentPage > 1) {
//               currentPage--;
//               renderUsers();
//             }
//           });

//         document
//           .getElementById("next-page")
//           .addEventListener("click", function () {
//             const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
//             if (currentPage < totalPages) {
//               currentPage++;
//               renderUsers();
//             }
//           }); 

//         // Initialize the table
//         renderUsers();

//         // // Sidebar Toggle (from main script)
//         const sidebarToggle = document.getElementById("sidebar-toggle");
//         const sidebar = document.querySelector(".sidebar");

//         sidebarToggle.addEventListener("click", function () {
//           sidebar.classList.toggle("active");
//         });

//         // Dropdown functionality
//         const dropdownBtn = document.querySelector(".dropdown-btn");
//         const dropdownContent = document.querySelector(".dropdown-content");

//         dropdownBtn.addEventListener("click", function () {
//           dropdownContent.style.display =
//             dropdownContent.style.display === "block" ? "none" : "block";
//         });

//         // Close dropdown when clicking outside
//         window.addEventListener("click", function (event) {
//           if (
//             !event.target.matches(".dropdown-btn") &&
//             !event.target.matches(".admin-avatar") &&
//             !event.target.matches(".fa-chevron-down")
//           ) {
//             if (dropdownContent.style.display === "block") {
//               dropdownContent.style.display = "none";
//             }
//           }
//         });
//       });
//     </script>
//   </body>
// </html>


// ----offer toogle controller  >-------

// export const toogleOffer = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const offer = await offerSchema.findById(id);
//     if (!offer) {
//       return res.status(404).json({
//         success: false,
//         message: "Offer not found",
//       });
//     }

//     // toggle the status
//     offer.isActive = !offer.isActive;
//     await offer.save();

//     res.status(200).json({
//       success: true,
//       message: `Offer has been ${offer.isActive ? "activated" : "deactivated"} successfully.`,
//       isActive: offer.isActive,
//     });
//   } catch (error) {
//     console.error("Error toggling offer status:", error);
//     next(error);
//   }
// };
