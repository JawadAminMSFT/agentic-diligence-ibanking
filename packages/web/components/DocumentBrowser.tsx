"use client";

import { useState, useEffect } from "react";
import { fetchDealDocuments, type DealDocument } from "@/lib/api-client";

const CATEGORY_COLORS: Record<string, string> = {
  Overview: "bg-blue-100 text-blue-700",
  Commercial: "bg-green-100 text-green-700",
  Financial: "bg-amber-100 text-amber-700",
  Legal: "bg-red-100 text-red-700",
  HR: "bg-purple-100 text-purple-700",
  Technology: "bg-slate-200 text-slate-700",
  Compliance: "bg-cyan-100 text-cyan-700",
  Management: "bg-indigo-100 text-indigo-700",
};

interface Props {
  dealId: string;
  dealName: string;
  onClose: () => void;
}

export default function DocumentBrowser({ dealId, dealName, onClose }: Props) {
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchDealDocuments(dealId)
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, [dealId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-[80vw] max-w-4xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{dealName}</h2>
            <p className="text-sm text-slate-500">Data Room Documents</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
            </div>
          ) : documents.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-400">
              No documents found for this deal.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider sticky top-0">
                  <th className="text-left px-6 py-3 font-medium">Document</th>
                  <th className="text-left px-6 py-3 font-medium">Category</th>
                  <th className="text-left px-6 py-3 font-medium">Uploaded</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => {
                  const badgeColor = CATEGORY_COLORS[doc.category] ?? "bg-slate-100 text-slate-600";
                  const isExpanded = expandedId === doc.documentId;
                  return (
                    <tr key={doc.documentId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-medium text-slate-900">{doc.title}</span>
                        {isExpanded && (
                          <p className="text-xs text-slate-500 mt-1">{doc.snippet}</p>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500">{doc.uploadedAt}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : doc.documentId)}
                          className="border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                        >
                          {isExpanded ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 shrink-0">
          <p className="text-xs text-slate-400">
            Full document content is analyzed by the AI agent during diligence runs
          </p>
        </div>
      </div>
    </div>
  );
}
