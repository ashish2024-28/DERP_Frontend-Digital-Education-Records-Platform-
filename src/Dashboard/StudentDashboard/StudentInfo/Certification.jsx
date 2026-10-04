import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./Certification.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getToken() {
    return localStorage.getItem("token");
}

function authHeaders() {
    const token = getToken();

    return token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {};
}

async function readResponse(response) {
    const text = await response.text();

    let result = {};

    if (text) {
        try {
            result = JSON.parse(text);
        } catch {
            result = {
                message: text,
            };
        }
    }

    if (!response.ok) {
        throw new Error(
            result?.message ||
                result?.error ||
                `Request failed with status ${response.status}`
        );
    }

    return result;
}

function getFileExtension(contentType = "") {
    const type = contentType.toLowerCase();

    if (type.includes("pdf")) return "pdf";
    if (type.includes("png")) return "png";
    if (type.includes("jpeg")) return "jpg";
    if (type.includes("jpg")) return "jpg";
    if (type.includes("webp")) return "webp";

    return "file";
}

function createSafeFileName(title, contentType) {
    const extension = getFileExtension(contentType);

    const cleanTitle =
        String(title || "certificate")
            .trim()
            .replace(/[^\w.-]+/g, "-")
            .replace(/^-+|-+$/g, "") || "certificate";

    return `${cleanTitle}.${extension}`;
}

function formatFileSize(bytes) {
    if (!bytes || bytes <= 0) return "";

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function Certification() {
    const { domain } = useParams();

    const fileInputRef = useRef(null);

    const [certifications, setCertifications] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);

    const [query, setQuery] = useState("");
    const [activeQuery, setActiveQuery] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searching, setSearching] = useState(false);

    const [downloadingId, setDownloadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const collectionUrl = `${API_BASE}/${domain}/student/certifications`;

    const clearMessages = () => {
        setMessage("");
        setError("");
    };

    const checkAuthentication = () => {
        if (!getToken()) {
            setError("Your session has expired. Please login again.");
            return false;
        }

        return true;
    };

    /*
     * =========================================================
     * LOAD MY CERTIFICATIONS
     * GET /{domain}/student/certifications/my
     * =========================================================
     */
    const loadCertifications = useCallback(async () => {
        if (!checkAuthentication()) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${collectionUrl}/my`, {
                method: "GET",
                headers: authHeaders(),
            });

            const result = await readResponse(response);

            /*
             * Controller returns List<CertificationResponseDTO>
             * directly, not ApiResponse.
             */
            setCertifications(Array.isArray(result) ? result : []);
        } catch (requestError) {
            console.error("Load certifications error:", requestError);

            setError(
                requestError?.message ||
                    "Unable to load your certifications."
            );
        } finally {
            setLoading(false);
        }
    }, [collectionUrl]);

    useEffect(() => {
        loadCertifications();
    }, [loadCertifications]);

    /*
     * =========================================================
     * FILE SELECTION
     * =========================================================
     */
    const handleFileChange = (event) => {
        clearMessages();

        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
        ];

        const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];

        const fileName = selectedFile.name.toLowerCase();

        const validType =
            allowedTypes.includes(selectedFile.type) ||
            allowedExtensions.some((extension) =>
                fileName.endsWith(extension)
            );

        if (!validType) {
            setError("Only PDF, PNG, JPG or JPEG files are allowed.");

            event.target.value = "";
            setFile(null);
            return;
        }

        /*
         * 100 KB frontend safety limit.
         * Backend can still enforce its own limit.
         */
        const maxSize = 100 * 1024;

        if (selectedFile.size > maxSize) {
            setError("Certificate file must not exceed 100 KB.");

            event.target.value = "";
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    /*
     * =========================================================
     * ADD CERTIFICATION
     *
     * POST
     * /{domain}/student/certifications/add
     *
     * multipart:
     * title
     * description
     * file
     * =========================================================
     */
    const addCertification = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!checkAuthentication()) {
            return;
        }

        const cleanTitle = title.trim();
        const cleanDescription = description.trim();

        if (!cleanTitle) {
            setError("Certificate title is required.");
            return;
        }

        if (!cleanDescription) {
            setError("Certificate description is required.");
            return;
        }

        if (!file) {
            setError("Please select a certificate file.");
            return;
        }

        const formData = new FormData();

        formData.append("title", cleanTitle);
        formData.append("description", cleanDescription);
        formData.append("file", file);

        try {
            setSaving(true);

            const response = await fetch(`${collectionUrl}/add`, {
                method: "POST",
                headers: authHeaders(),

                /*
                 * IMPORTANT:
                 * Do NOT set Content-Type manually.
                 * Browser creates multipart/form-data boundary.
                 */
                body: formData,
            });

            await readResponse(response);

            setMessage(
                "Certification uploaded successfully and added to your student record."
            );

            setTitle("");
            setDescription("");
            setFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            /*
             * Return to normal list after upload.
             */
            setQuery("");
            setActiveQuery("");

            await loadCertifications();
        } catch (requestError) {
            console.error("Upload certification error:", requestError);

            setError(
                requestError?.message ||
                    "Unable to upload certification."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
     * =========================================================
     * SEARCH
     *
     * GET
     * /{domain}/student/certifications/search?title=...
     * =========================================================
     */
    const searchCertifications = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!checkAuthentication()) {
            return;
        }

        const searchTitle = query.trim();

        /*
         * Empty search = load all.
         */
        if (!searchTitle) {
            setActiveQuery("");
            await loadCertifications();
            return;
        }

        try {
            setSearching(true);

            const response = await fetch(
                `${collectionUrl}/search?title=${encodeURIComponent(
                    searchTitle
                )}`,
                {
                    method: "GET",
                    headers: authHeaders(),
                }
            );

            const result = await readResponse(response);

            setCertifications(
                Array.isArray(result) ? result : []
            );

            setActiveQuery(searchTitle);
        } catch (requestError) {
            console.error("Search certification error:", requestError);

            setError(
                requestError?.message ||
                    "Unable to search certifications."
            );
        } finally {
            setSearching(false);
        }
    };

    /*
     * =========================================================
     * CLEAR SEARCH
     * =========================================================
     */
    const clearSearch = async () => {
        setQuery("");
        setActiveQuery("");
        clearMessages();

        await loadCertifications();
    };

    /*
     * =========================================================
     * DOWNLOAD
     *
     * GET
     * /{domain}/student/certifications/{id}/file
     *
     * We construct the URL directly from your controller.
     * We do NOT depend on downloadUrl coming from DTO.
     * =========================================================
     */
    const downloadCertification = async (certification) => {
        clearMessages();

        if (!checkAuthentication()) {
            return;
        }

        const certificationId = certification?.id;

        if (!certificationId) {
            setError("Certificate ID is missing.");
            return;
        }

        setDownloadingId(certificationId);

        try {
            const response = await fetch(
                `${collectionUrl}/${certificationId}/file`,
                {
                    method: "GET",
                    headers: authHeaders(),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText ||
                        "Unable to download this certificate."
                );
            }

            const blob = await response.blob();

            const contentType =
                response.headers.get("content-type") || "";

            const objectUrl = URL.createObjectURL(blob);

            const anchor = document.createElement("a");

            anchor.href = objectUrl;

            anchor.download = createSafeFileName(
                certification.title,
                contentType
            );

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            window.setTimeout(() => {
                URL.revokeObjectURL(objectUrl);
            }, 1000);

            setMessage(
                `"${certification.title}" downloaded successfully.`
            );
        } catch (requestError) {
            console.error(
                "Download certification error:",
                requestError
            );

            setError(
                requestError?.message ||
                    "Unable to download certificate."
            );
        } finally {
            setDownloadingId(null);
        }
    };

    /*
     * =========================================================
     * DELETE
     *
     * DELETE
     * /{domain}/student/certifications/{id}
     * =========================================================
     */
    const deleteCertification = async (certification) => {
        clearMessages();

        if (!checkAuthentication()) {
            return;
        }

        const certificationId = certification?.id;

        if (!certificationId) {
            setError("Certificate ID is missing.");
            return;
        }

        setDeletingId(certificationId);

        try {
            const response = await fetch(
                `${collectionUrl}/${certificationId}`,
                {
                    method: "DELETE",
                    headers: authHeaders(),
                }
            );

            await readResponse(response);

            setMessage(
                `"${certification.title}" was deleted successfully.`
            );

            setConfirmDeleteId(null);

            await loadCertifications();
        } catch (requestError) {
            console.error(
                "Delete certification error:",
                requestError
            );

            setError(
                requestError?.message ||
                    "Unable to delete this certification."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const totalCertificates = certifications.length;

    return (
        <main className="certification-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}
            <header className="certification-header">

                <div className="certification-header-content">
                    <div className="certification-header-icon">
                        ✓
                    </div>

                    <div>
                        <p className="certification-eyebrow">
                            STUDENT RECORDS
                        </p>

                        <h1>Certifications</h1>

                        <p className="certification-subtitle">
                            Store, manage and access your academic
                            and professional certificates.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="certification-refresh-btn"
                    onClick={loadCertifications}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "↻ Refresh"}
                </button>
            </header>

            {/* =================================================
                NOTICES
            ================================================= */}
            {error && (
                <div
                    className="certification-notice certification-notice-error"
                    role="alert"
                >
                    <span className="notice-icon">!</span>

                    <div>
                        <strong>Something went wrong</strong>
                        <p>{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setError("")}
                    >
                        ×
                    </button>
                </div>
            )}

            {message && (
                <div
                    className="certification-notice certification-notice-success"
                    role="status"
                >
                    <span className="notice-icon">✓</span>

                    <div>
                        <strong>Success</strong>
                        <p>{message}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMessage("")}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* =================================================
                TOP STATISTICS
            ================================================= */}
            <section className="certification-stats">

                <div className="certification-stat-card">
                    <div className="stat-icon">✓</div>

                    <div>
                        <span>Total Certificates</span>
                        <strong>
                            {loading ? "..." : totalCertificates}
                        </strong>
                    </div>
                </div>

                <div className="certification-stat-card">
                    <div className="stat-icon">↥</div>

                    <div>
                        <span>Storage</span>
                        <strong>Secure</strong>
                    </div>
                </div>

                <div className="certification-stat-card">
                    <div className="stat-icon">▣</div>

                    <div>
                        <span>Supported Files</span>
                        <strong>PDF / Images</strong>
                    </div>
                </div>
            </section>

            {/* =================================================
                UPLOAD SECTION
            ================================================= */}
            <section className="certification-panel">

                <div className="certification-panel-header">

                    <div>
                        <span className="section-number">
                            01
                        </span>

                        <div>
                            <h2>Add Certification</h2>

                            <p>
                                Upload a certificate to your student
                                record.
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    className="certification-form"
                    onSubmit={addCertification}
                >

                    <div className="certification-form-grid">

                        <div className="certification-field">
                            <label htmlFor="certificate-title">
                                Certificate Title
                            </label>

                            <input
                                id="certificate-title"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                maxLength={150}
                                placeholder="e.g. Java Programming Certificate"
                                required
                            />

                            <small>
                                {title.length}/150
                            </small>
                        </div>

                        <div className="certification-field">
                            <label htmlFor="certificate-description">
                                Description
                            </label>

                            <textarea
                                id="certificate-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                maxLength={1000}
                                rows={4}
                                placeholder="Describe the certification, course, workshop or achievement..."
                                required
                            />

                            <small>
                                {description.length}/1000
                            </small>
                        </div>

                        <div className="certification-field certification-file-field">
                            <label htmlFor="certificate-file">
                                Certificate File
                            </label>

                            <div
                                className={`certification-dropzone ${
                                    file
                                        ? "has-file"
                                        : ""
                                }`}
                            >
                                <div className="upload-icon">
                                    ↑
                                </div>

                                <div className="upload-text">
                                    <strong>
                                        {file
                                            ? file.name
                                            : "Choose certificate file"}
                                    </strong>

                                    <span>
                                        PDF, PNG, JPG or JPEG ·
                                        Maximum 100 KB
                                    </span>
                                </div>

                                <label
                                    htmlFor="certificate-file"
                                    className="choose-file-btn"
                                >
                                    Browse
                                </label>

                                <input
                                    ref={fileInputRef}
                                    id="certificate-file"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {file && (
                                <div className="selected-file">

                                    <span>✓</span>

                                    <div>
                                        <strong>
                                            {file.name}
                                        </strong>

                                        <small>
                                            {formatFileSize(
                                                file.size
                                            )}
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);

                                            if (
                                                fileInputRef.current
                                            ) {
                                                fileInputRef.current.value =
                                                    "";
                                            }
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="certification-form-footer">

                        <span>
                            Your certificate will be stored in your
                            student record.
                        </span>

                        <button
                            type="submit"
                            className="certification-primary-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Uploading..."
                                : "Upload Certification"}
                        </button>
                    </div>
                </form>
            </section>

            {/* =================================================
                CERTIFICATE LIST
            ================================================= */}
            <section className="certification-panel">

                <div className="certification-list-header">

                    <div className="certification-panel-title">

                        <span className="section-number">
                            02
                        </span>

                        <div>
                            <h2>My Certifications</h2>

                            <p>
                                {activeQuery
                                    ? `Search results for "${activeQuery}"`
                                    : `${totalCertificates} certificate${
                                          totalCertificates === 1
                                              ? ""
                                              : "s"
                                      } saved`}
                            </p>
                        </div>
                    </div>

                    {/* SEARCH */}
                    <form
                        className="certification-search"
                        onSubmit={searchCertifications}
                    >
                        <div className="search-input-wrapper">
                            <span>⌕</span>

                            <input
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search by certificate title..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={searching}
                        >
                            {searching
                                ? "Searching..."
                                : "Search"}
                        </button>

                        {activeQuery && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={clearSearch}
                            >
                                Clear
                            </button>
                        )}
                    </form>
                </div>

                {/* LOADING */}
                {loading ? (
                    <div className="certification-loading">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading your certifications...
                        </p>
                    </div>
                ) : certifications.length === 0 ? (
                    /* EMPTY */
                    <div className="certification-empty">

                        <div className="empty-icon">
                            ✓
                        </div>

                        <h3>
                            {activeQuery
                                ? "No certificates found"
                                : "No certifications yet"}
                        </h3>

                        <p>
                            {activeQuery
                                ? "Try another certificate title."
                                : "Upload your first certificate using the form above."}
                        </p>

                        {activeQuery && (
                            <button
                                type="button"
                                onClick={clearSearch}
                            >
                                View all certificates
                            </button>
                        )}
                    </div>
                ) : (
                    /* LIST */
                    <div className="certification-list">

                        {certifications.map(
                            (certification, index) => (
                                <article
                                    className="certification-card"
                                    key={
                                        certification.id ||
                                        `certificate-${index}`
                                    }
                                >
                                    {/* NUMBER / ICON */}
                                    <div className="certificate-card-number">
                                        {String(index + 1).padStart(
                                            2,
                                            "0"
                                        )}
                                    </div>

                                    <div className="certificate-card-icon">
                                        ✓
                                    </div>

                                    {/* CONTENT */}
                                    <div className="certificate-card-content">

                                        <div className="certificate-card-title-row">
                                            <h3>
                                                {
                                                    certification.title
                                                }
                                            </h3>

                                            <span className="certificate-status">
                                                Verified Record
                                            </span>
                                        </div>

                                        <p>
                                            {certification.description ||
                                                "No description provided."}
                                        </p>

                                        <div className="certificate-meta">

                                            {certification.createdDateTime && (
                                                <span>
                                                    Added{" "}
                                                    {formatDate(
                                                        certification.createdDateTime
                                                    )}
                                                </span>
                                            )}

                                            {certification.fileName && (
                                                <span>
                                                    File:{" "}
                                                    {
                                                        certification.fileName
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="certificate-card-actions">

                                        <button
                                            type="button"
                                            className="certificate-download-btn"
                                            onClick={() =>
                                                downloadCertification(
                                                    certification
                                                )
                                            }
                                            disabled={
                                                downloadingId ===
                                                certification.id
                                            }
                                        >
                                            {downloadingId ===
                                            certification.id
                                                ? "Downloading..."
                                                : "↓ Download"}
                                        </button>

                                        {confirmDeleteId ===
                                        certification.id ? (
                                            <div className="delete-confirm">

                                                <span>
                                                    Delete this
                                                    certificate?
                                                </span>

                                                <button
                                                    type="button"
                                                    className="confirm-delete-btn"
                                                    onClick={() =>
                                                        deleteCertification(
                                                            certification
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        certification.id
                                                    }
                                                >
                                                    {deletingId ===
                                                    certification.id
                                                        ? "Deleting..."
                                                        : "Yes, Delete"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="cancel-delete-btn"
                                                    onClick={() =>
                                                        setConfirmDeleteId(
                                                            null
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                className="certificate-delete-btn"
                                                onClick={() =>
                                                    setConfirmDeleteId(
                                                        certification.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}