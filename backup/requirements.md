### Requirement 6

**User Story:** As a visitor, I want to upvote or downvote experiments, so that the best and most interesting experiments rise to the top.

#### Acceptance Criteria

1. WHEN a user views an experiment card THEN the system SHALL display upvote and downvote buttons with the current vote count
2. WHEN a user clicks upvote or downvote THEN the system SHALL update the vote count in real time
3. WHEN a user votes THEN the system SHALL store the vote in Supabase
4. IF a user has already voted THEN the system SHALL prevent multiple votes from the same user (per device/session)
5. WHEN the gallery loads THEN the system SHALL display experiments sorted by vote count (highest first)
6. IF Supabase is unavailable THEN the system SHALL display a user-friendly error and allow retrying the vote
