import React, { useState } from "react";
import { AppLayout } from "../App.js";
import "../styles.css";

const initialTopics = {
  "DSA": [
    {
      title: "Two Pointers",
      problems: [
        { name: "Pair with Target Sum", link: "https://leetcode.com/problems/two-sum/", done: true },
        { name: "Remove Duplicates", link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", done: true },
        { name: "Squaring a Sorted Array", link: "https://leetcode.com/problems/squares-of-a-sorted-array/", done: false },
      ]
    },
    {
      title: "Sliding Window",
      problems: [
        { name: "Maximum Sum Subarray of Size K", link: "https://leetcode.com/problems/maximum-average-subarray-i/", done: false },
      ]
    }
  ],
  "System Design": []
};

const aiResponses = {
  "Two Pointers": "The Two Pointers technique involves using two indices to traverse an array or list from different positions, often to find pairs or optimize searches in sorted data.",
  "Sliding Window": "The Sliding Window technique maintains a window of elements and adjusts its size to find optimal subarrays or substrings that satisfy certain conditions.",
  "Pair with Target Sum": `Here's a sample solution for "Pair with Target Sum":
\`\`\`python
def twoSum(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        curr_sum = nums[left] + nums[right]
        if curr_sum == target:
            return [left, right]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []
\`\`\`
This uses two pointers to find a pair summing to the target in a sorted array.`,
  "Remove Duplicates": `Here's a sample solution for "Remove Duplicates":
\`\`\`python
def removeDuplicates(nums):
    if not nums:
        return 0
    write_pointer = 1
    for read_pointer in range(1, len(nums)):
        if nums[read_pointer] != nums[write_pointer - 1]:
            nums[write_pointer] = nums[read_pointer]
            write_pointer += 1
    return write_pointer
\`\`\`
This uses two pointers to remove duplicates in-place from a sorted array.`,
  "Squaring a Sorted Array": `Here's a sample solution for "Squaring a Sorted Array":
\`\`\`python
def sortedSquares(nums):
    n = len(nums)
    result = [0] * n
    left, right, pos = 0, n - 1, n - 1
    while left <= right:
        left_square = nums[left] * nums[left]
        right_square = nums[right] * nums[right]
        if left_square > right_square:
            result[pos] = left_square
            left += 1
        else:
            result[pos] = right_square
            right -= 1
        pos -= 1
    return result
\`\`\`
This uses two pointers to square and sort the array efficiently.`,
  "Maximum Sum Subarray of Size K": `Here's a sample solution for "Maximum Sum Subarray of Size K":
\`\`\`python
def maxSumSubarray(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(len(nums) - k):
        window_sum = window_sum - nums[i] + nums[i + k]
        max_sum = max(max_sum, window_sum)
    return max_sum
\`\`\`
This uses a sliding window to find the maximum sum subarray of size K.`,
};

const AddTopicModal = ({ onAdd, onCancel }) => {
  const [title, setTitle] = useState('');
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Topic</h2>
        <div className="input-group">
          <label htmlFor="topic-title">Topic Title</label>
          <input id="topic-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., System Design" />
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn topics-btn-secondary">Cancel</button>
          <button onClick={() => onAdd(title)} className="btn topics-btn-primary">Add Topic</button>
        </div>
      </div>
    </div>
  );
};

const AddSubtopicModal = ({ onAdd, onCancel }) => {
  const [title, setTitle] = useState('');
  const [problems, setProblems] = useState('');
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Subtopic</h2>
        <div className="input-group">
          <label htmlFor="subtopic-title">Subtopic Title</label>
          <input id="subtopic-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Two Pointers" />
        </div>
        <div className="input-group">
          <label htmlFor="problems">Problems (one per line, format: Problem Name | LeetCode Link)</label>
          <textarea id="problems" value={problems} onChange={e => setProblems(e.target.value)} rows="5" placeholder="Pair with Target Sum | https://leetcode.com/problems/two-sum/"></textarea>
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn topics-btn-secondary">Cancel</button>
          <button onClick={() => onAdd(title, problems)} className="btn topics-btn-primary">Add Subtopic</button>
        </div>
      </div>
    </div>
  );
};

const AddProblemModal = ({ subtopicTitle, onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Problem to {subtopicTitle}</h2>
        <div className="input-group">
          <label htmlFor="problem-name">Problem Name</label>
          <input id="problem-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Pair with Target Sum" />
        </div>
        <div className="input-group">
          <label htmlFor="problem-link">LeetCode Link (Optional)</label>
          <input id="problem-link" type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="e.g., https://leetcode.com/problems/two-sum/" />
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn topics-btn-secondary">Cancel</button>
          <button onClick={() => onAdd(name, link)} className="btn topics-btn-primary">Add Problem</button>
        </div>
      </div>
    </div>
  );
};

const AIHelpModal = ({ title, onClose }) => {
  const response = aiResponses[title] || `Here's a quick explanation for ${title}: [Placeholder AI response for this topic/problem].`;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Quick AI Help: {title}</h2>
        <div className="ai-response">{response}</div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn topics-btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default function Topics() {
  const [topics, setTopics] = useState(initialTopics);
  const [selectedTopic, setSelectedTopic] = useState("DSA");
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showAddSubtopicModal, setShowAddSubtopicModal] = useState(false);
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [showAIHelpModal, setShowAIHelpModal] = useState(false);
  const [aiHelpTitle, setAIHelpTitle] = useState('');

  const handleAddTopic = (title) => {
    if (title && !topics[title]) {
      setTopics({ ...topics, [title]: [] });
      setSelectedTopic(title);
    }
    setShowAddTopicModal(false);
  };

  const handleAddSubtopic = (title, problemsText) => {
    if (title && problemsText) {
      const problemList = problemsText.split('\n').filter(p => p.trim() !== '').map(line => {
        const [name, link] = line.split('|').map(part => part.trim());
        return { name, link: link || '', done: false };
      });
      const newSubtopics = [...topics[selectedTopic], { title, problems: problemList }];
      setTopics({ ...topics, [selectedTopic]: newSubtopics });
    }
    setShowAddSubtopicModal(false);
  };

  const handleAddProblem = (subtopicTitle, name, link) => {
    if (name) {
      const newTopics = { ...topics };
      const subtopicIndex = newTopics[selectedTopic].findIndex(sub => sub.title === subtopicTitle);
      if (subtopicIndex !== -1) {
        newTopics[selectedTopic][subtopicIndex].problems.push({ name, link: link || '', done: false });
        setTopics(newTopics);
      }
    }
    setShowAddProblemModal(false);
    setSelectedSubtopic(null);
  };

  const toggleProblem = (subtopicIndex, problemIndex) => {
    const newTopics = { ...topics };
    newTopics[selectedTopic][subtopicIndex].problems[problemIndex].done = !newTopics[selectedTopic][subtopicIndex].problems[problemIndex].done;
    setTopics(newTopics);
  };

  const handleShowAIHelp = (title) => {
    setAIHelpTitle(title);
    setShowAIHelpModal(true);
  };

  const handleShowAddProblem = (subtopicTitle) => {
    setSelectedSubtopic(subtopicTitle);
    setShowAddProblemModal(true);
  };

  return (
    <AppLayout pageTitle="Topics">
      {showAddTopicModal && <AddTopicModal onAdd={handleAddTopic} onCancel={() => setShowAddTopicModal(false)} />}
      {showAddSubtopicModal && <AddSubtopicModal onAdd={handleAddSubtopic} onCancel={() => setShowAddSubtopicModal(false)} />}
      {showAddProblemModal && (
        <AddProblemModal
          subtopicTitle={selectedSubtopic}
          onAdd={(name, link) => handleAddProblem(selectedSubtopic, name, link)}
          onCancel={() => setShowAddProblemModal(false)}
        />
      )}
      {showAIHelpModal && <AIHelpModal title={aiHelpTitle} onClose={() => setShowAIHelpModal(false)} />}
      <div className="topics-layout">
        <div className="card topics-list">
          <div className="card-header">
            <h2>All Topics</h2>
            <button onClick={() => setShowAddTopicModal(true)} className="btn topics-btn-primary icon-btn" aria-label="Add new topic">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-text)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
          </div>
          <div className="card-body">
            {Object.keys(topics).map((topicName) => (
              <div
                key={topicName}
                className={`topic-item ${selectedTopic === topicName ? 'active' : ''}`}
                onClick={() => setSelectedTopic(topicName)}
              >
                {topicName}
              </div>
            ))}
          </div>
        </div>
        <div className="card topic-details">
          <div className="card-header">
            <h2>{selectedTopic}</h2>
            <button onClick={() => setShowAddSubtopicModal(true)} className="btn topics-btn-primary">Add Subtopic</button>
          </div>
          <div className="card-body">
            {topics[selectedTopic]?.length > 0 ? (
              topics[selectedTopic].map((subtopic, subIndex) => (
                <div key={subIndex} className="subtopic-item">
                  <div className="subtopic-header">
                    <h3>{subtopic.title}</h3>
                    <div className="subtopic-actions">
                      <button
                        onClick={() => handleShowAIHelp(subtopic.title)}
                        className="btn topics-btn-secondary"
                        aria-label={`Quick AI help for ${subtopic.title}`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--text-primary)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="icon"
                        >
                          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                          <path d="M12 12l3 3" />
                          <path d="M12 7v5" />
                        </svg>
                        Quick AI Help
                      </button>
                      <button
                        onClick={() => handleShowAddProblem(subtopic.title)}
                        className="btn topics-btn-primary icon-btn"
                        aria-label={`Add problem to ${subtopic.title}`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent-text)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="icon"
                        >
                          <path d="M12 5v14" />
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {subtopic.problems.map((problem, probIndex) => (
                    <div key={probIndex} className="problem-item">
                      <input
                        type="checkbox"
                        id={`${subIndex}-${probIndex}`}
                        checked={problem.done}
                        onChange={() => toggleProblem(subIndex, probIndex)}
                      />
                      <label htmlFor={`${subIndex}-${probIndex}`} className="problem-label">
                        {problem.link ? (
                          <a href={problem.link} target="_blank" rel="noopener noreferrer">{problem.name}</a>
                        ) : (
                          problem.name
                        )}
                      </label>
                      <button
                        onClick={() => handleShowAIHelp(problem.name)}
                        className="btn topics-btn-secondary"
                        aria-label={`Quick AI help for ${problem.name}`}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--text-primary)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="icon"
                        >
                          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                          <path d="M12 12l3 3" />
                          <path d="M12 7v5" />
                        </svg>
                        Code Sample
                      </button>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="no-subtopics">No subtopics yet. Click "Add Subtopic" to get started.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}