#!/usr/bin/env ruby

require "date"
require "yaml"

POST_GLOB = "_posts/**/*.{md,markdown}".freeze
REQUIRED_FIELDS = %w[
  layout
  title
  description
  date
  categories
  tags
  article_type
  content_score
  score_basis
  permalink
].freeze
ALLOWED_CATEGORIES = %w[tech tutorials].freeze
ALLOWED_ARTICLE_TYPES = %w[
  concept
  comparison
  guide
  troubleshooting
  case-study
  opinion
].freeze
ALLOWED_DIFFICULTIES = %w[beginner intermediate advanced].freeze
MUSIC_TAXONOMY_GROUPS = %w[languages genres tags].freeze
MOVIE_REQUIRED_FIELDS = %w[
  original_title
  count
  type
  premiere_date
  imdb_url
  poster
  awards
  tags
  note
].freeze
BOOK_REQUIRED_FIELDS = %w[
  original_title
  chinese_title
  count
  authors
  category
  tags
  original_publish_date
  publisher
  isbn
  source_url
  note
].freeze
ALBUM_REQUIRED_FIELDS = %w[
  id
  title
  original_title
  count
  artist
  artists
  release_date
  release_type
  languages
  genre
  track_count
  duration
  label
  artwork_url
  note
  listen_links
].freeze
LITERATURE_REQUIRED_FIELDS = %w[
  id
  title
  author
  period
  region
  type
  form
  language
  aliases
  content
  translated_content
  note
  source_label
  source_url
].freeze
LITERATURE_FORMS = %w[verse prose].freeze

errors = []

Dir.glob(POST_GLOB).sort.each do |path|
  content = File.read(path, encoding: "UTF-8")
  match = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)

  unless match
    errors << "#{path}: missing valid YAML front matter"
    next
  end

  begin
    data = YAML.safe_load(
      match[1],
      permitted_classes: [Date, Time],
      aliases: true
    ) || {}
  rescue Psych::SyntaxError => error
    errors << "#{path}: invalid YAML (#{error.message.lines.first.strip})"
    next
  end

  REQUIRED_FIELDS.each do |field|
    value = data[field]
    errors << "#{path}: missing #{field}" if value.nil? || value == ""
  end

  errors << "#{path}: layout must be post" unless data["layout"] == "post"

  description_length = data["description"].to_s.length
  unless description_length.between?(20, 160)
    errors << "#{path}: description must contain 20-160 characters (got #{description_length})"
  end

  categories = data["categories"]
  unless categories.is_a?(Array) && categories.length == 1 &&
         ALLOWED_CATEGORIES.include?(categories.first)
    errors << "#{path}: categories must be a one-item array using #{ALLOWED_CATEGORIES.join(", ")}"
  end

  tags = data["tags"]
  unless tags.is_a?(Array) && tags.length.between?(2, 5) &&
         tags.all? { |tag| tag.is_a?(String) && !tag.empty? }
    errors << "#{path}: tags must be an array containing 2-5 non-empty strings"
  end

  unless ALLOWED_ARTICLE_TYPES.include?(data["article_type"])
    errors << "#{path}: unknown article_type #{data["article_type"].inspect}"
  end

  content_score = data["content_score"]
  unless content_score.is_a?(Numeric) && content_score.between?(6.0, 10.0)
    errors << "#{path}: content_score must be a number from 6.0 to 10.0"
  end

  score_basis = data["score_basis"].to_s.strip
  if score_basis.length < 20
    errors << "#{path}: score_basis must explain the score in at least 20 characters"
  end

  difficulty = data["difficulty"]
  if difficulty && !ALLOWED_DIFFICULTIES.include?(difficulty)
    errors << "#{path}: unknown difficulty #{difficulty.inspect}"
  end

  permalink = data["permalink"].to_s
  unless permalink.start_with?("/") && !permalink.match?(/\s/)
    errors << "#{path}: permalink must be a whitespace-free absolute path"
  end

end

begin
  music = YAML.safe_load_file(
    "_data/music.yml",
    permitted_classes: [Date, Time],
    aliases: true
  ) || []
  music_taxonomy = YAML.safe_load_file("_data/music_taxonomy.yml", aliases: true) || {}
  albums = YAML.safe_load_file("_data/albums.yml", aliases: true) || []
  album_ids = albums.map { |album| album["id"] }.compact
  person_names = YAML.safe_load_file("_data/person_names.yml", aliases: true) || {}
  group_names = YAML.safe_load_file("_data/group_names.yml", aliases: true) || {}

  music.each do |track|
    title = track["title"] || "(untitled)"
    primary_genre = track["primary_genre"]

    if track.key?("contexts")
      errors << "_data/music.yml: #{title} contexts has been folded into tags"
    end

    album_id = track["album_id"]
    if album_id && !album_ids.include?(album_id)
      errors << "_data/music.yml: #{title} references unknown album_id: #{album_id}"
    end
    if album_id && track["id"].to_s.empty?
      errors << "_data/music.yml: #{title} needs id when album_id is present"
    end

    %w[title original_title].each do |field|
      if track[field].to_s.strip.empty?
        errors << "_data/music.yml: #{title} missing naming field: #{field}"
      end
    end

    artists = track["artists"]
    expected_artist = Array(artists).join("; ")
    if track["artist"] != expected_artist
      errors << "_data/music.yml: #{title} artist must match artists joined with semicolons"
    end

    credit_names = Array(artists) + Array(track["lyricists"]) + Array(track["composers"])
    unmapped_credit_names = credit_names.uniq.reject do |name|
      person_names.key?(name) || group_names.key?(name)
    end
    unless unmapped_credit_names.empty?
      errors << "_data/music.yml: #{title} has unmapped credit names: #{unmapped_credit_names.join(", ")}"
    end

    if album_id
      linked_album = albums.find { |album| album["id"] == album_id }
      valid_album_titles = [linked_album&.fetch("title", nil), linked_album&.fetch("original_title", nil)].compact
      unless valid_album_titles.include?(track["release_title"])
        errors << "_data/music.yml: #{title} release_title does not match linked album #{album_id}"
      end
    end

    if primary_genre.to_s.empty?
      errors << "_data/music.yml: #{title} primary_genre must not be empty"
    elsif !music_taxonomy.fetch("genres", {}).key?(primary_genre)
      errors << "_data/music.yml: #{title} has unmapped primary_genre: #{primary_genre}"
    end

    MUSIC_TAXONOMY_GROUPS.each do |group|
      values = track[group]
      unless values.is_a?(Array)
        errors << "_data/music.yml: #{title} #{group} must be an array"
        next
      end

      if group == "languages" && values.empty?
        errors << "_data/music.yml: #{title} #{group} must not be empty"
      end

      if group == "genres" && values.include?(primary_genre)
        errors << "_data/music.yml: #{title} genres must not repeat primary_genre"
      end

      taxonomy_group = group == "genres" ? "genre_styles" : group
      unknown_values = values - music_taxonomy.fetch(taxonomy_group, {}).keys
      next if unknown_values.empty?

      errors << "_data/music.yml: #{title} has unmapped #{group}: #{unknown_values.join(", ")}"
    end
  end
rescue Psych::SyntaxError => error
  errors << "_data/music.yml or _data/music_taxonomy.yml: invalid YAML (#{error.message.lines.first.strip})"
end

begin
  albums = YAML.safe_load_file(
    "_data/albums.yml",
    permitted_classes: [Date, Time],
    aliases: true
  ) || []
  music_taxonomy = YAML.safe_load_file("_data/music_taxonomy.yml", aliases: true) || {}
  person_names = YAML.safe_load_file("_data/person_names.yml", aliases: true) || {}
  group_names = YAML.safe_load_file("_data/group_names.yml", aliases: true) || {}

  albums.each do |album|
    title = album["title"] || "(untitled)"

    ALBUM_REQUIRED_FIELDS.each do |field|
      value = album[field]
      missing_value = value.nil? || (field != "note" && value == "")
      errors << "_data/albums.yml: #{title} missing #{field}" if missing_value
    end

    artists = album["artists"]
    unless artists.is_a?(Array) && !artists.empty?
      errors << "_data/albums.yml: #{title} artists must be a non-empty array"
    end

    expected_artist = Array(artists).join("; ")
    if album["artist"] != expected_artist
      errors << "_data/albums.yml: #{title} artist must match artists joined with semicolons"
    end

    unmapped_artists = Array(artists).uniq.reject do |name|
      person_names.key?(name) || group_names.key?(name)
    end
    unless unmapped_artists.empty?
      errors << "_data/albums.yml: #{title} has unmapped artists: #{unmapped_artists.join(", ")}"
    end

    languages = album["languages"]
    unless languages.is_a?(Array) && !languages.empty?
      errors << "_data/albums.yml: #{title} languages must be a non-empty array"
      next
    end

    unknown_languages = languages - music_taxonomy.fetch("languages", {}).keys
    unless unknown_languages.empty?
      errors << "_data/albums.yml: #{title} has unmapped languages: #{unknown_languages.join(", ")}"
    end
  end


  duplicate_album_ids = albums.map { |album| album["id"] }.compact.tally.select { |_id, count| count > 1 }.keys
  unless duplicate_album_ids.empty?
    errors << "_data/albums.yml: duplicate ids: #{duplicate_album_ids.join(", ")}"
  end
rescue Psych::SyntaxError => error
  errors << "_data/albums.yml: invalid YAML (#{error.message.lines.first.strip})"
end

begin
  movies = YAML.safe_load_file(
    "_data/movies.yml",
    permitted_classes: [Date, Time],
    aliases: true
  ) || []
  movie_types = YAML.safe_load_file("_data/movie_types.yml", aliases: true) || {}
  person_names = YAML.safe_load_file("_data/person_names.yml", aliases: true) || {}
  group_names = YAML.safe_load_file("_data/group_names.yml", aliases: true) || {}

  movies.each do |movie|
    title = movie["chinese_title"] || movie["original_title"] || "(untitled)"

    MOVIE_REQUIRED_FIELDS.each do |field|
      value = movie[field]
      missing_value = value.nil? || (field != "note" && value == "")
      errors << "_data/movies.yml: #{title} missing #{field}" if missing_value
    end

    credit_names = movie["directors"] || [movie["director"]].compact
    if credit_names.empty?
      errors << "_data/movies.yml: #{title} missing director or directors"
    elsif !credit_names.is_a?(Array)
      errors << "_data/movies.yml: #{title} directors must be an array"
    elsif credit_names.any? { |name| name.to_s.strip.empty? }
      errors << "_data/movies.yml: #{title} directors must not contain empty names"
    end

    unmapped_credit_names = (credit_names + Array(movie["cast"])).uniq.reject do |name|
      person_names.key?(name) || group_names.key?(name)
    end
    unless unmapped_credit_names.empty?
      errors << "_data/movies.yml: #{title} has unmapped credit names: #{unmapped_credit_names.join(", ")}"
    end

    type = movie["type"]
    type_label = movie_types[type]
    if type.to_s.empty?
      errors << "_data/movies.yml: #{title} type must not be empty"
    elsif !movie_types.key?(type)
      errors << "_data/movies.yml: #{title} has unmapped type: #{type}"
    end

    poster = movie["poster"].to_s
    if poster.empty?
      errors << "_data/movies.yml: #{title} poster must not be empty"
    elsif !File.exist?(poster.sub(%r{\A/}, ""))
      errors << "_data/movies.yml: #{title} poster file does not exist: #{poster}"
    end

    tags = movie["tags"]
    unless tags.is_a?(Array)
      errors << "_data/movies.yml: #{title} tags must be an array"
      next
    end

    if type_label && tags.include?(type_label)
      errors << "_data/movies.yml: #{title} tags must not repeat type label: #{type_label}"
    end

    cast = movie["cast"]
    if cast && !cast.is_a?(Array)
      errors << "_data/movies.yml: #{title} cast must be an array"
    elsif cast&.any? { |member| member.to_s.strip.empty? }
      errors << "_data/movies.yml: #{title} cast must not contain empty names"
    end
  end
rescue Psych::SyntaxError => error
  errors << "_data/movies.yml or _data/movie_types.yml: invalid YAML (#{error.message.lines.first.strip})"
end

begin
  books = YAML.safe_load_file(
    "_data/books.yml",
    permitted_classes: [Date, Time],
    aliases: true
  ) || []
  person_names = YAML.safe_load_file("_data/person_names.yml", aliases: true) || {}
  group_names = YAML.safe_load_file("_data/group_names.yml", aliases: true) || {}

  books.each do |book|
    title = book["chinese_title"] || book["original_title"] || "(untitled)"

    BOOK_REQUIRED_FIELDS.each do |field|
      value = book[field]
      missing_value = value.nil? || (field != "note" && value == "")
      errors << "_data/books.yml: #{title} missing #{field}" if missing_value
    end

    authors = book["authors"]
    if authors && !authors.is_a?(Array)
      errors << "_data/books.yml: #{title} authors must be an array"
    elsif authors&.any? { |author| author.to_s.strip.empty? }
      errors << "_data/books.yml: #{title} authors must not contain empty names"
    end

    translators = book["translators"]
    if translators && !translators.is_a?(Array)
      errors << "_data/books.yml: #{title} translators must be an array"
    elsif translators&.any? { |translator| translator.to_s.strip.empty? }
      errors << "_data/books.yml: #{title} translators must not contain empty names"
    end

    unmapped_book_names = (Array(authors) + Array(translators)).uniq.reject do |name|
      person_names.key?(name) || group_names.key?(name)
    end
    unless unmapped_book_names.empty?
      errors << "_data/books.yml: #{title} has unmapped person names: #{unmapped_book_names.join(", ")}"
    end

    tags = book["tags"]
    unless tags.is_a?(Array)
      errors << "_data/books.yml: #{title} tags must be an array"
    end
  end
rescue Psych::SyntaxError => error
  errors << "_data/books.yml: invalid YAML (#{error.message.lines.first.strip})"
end

begin
  literature = YAML.safe_load_file(
    "_data/literature.yml",
    permitted_classes: [Date, Time],
    aliases: true
  ) || []
  person_names = YAML.safe_load_file("_data/person_names.yml", aliases: true) || {}

  literature.each do |work|
    title = work["title"] || "(untitled)"

    LITERATURE_REQUIRED_FIELDS.each do |field|
      errors << "_data/literature.yml: #{title} missing #{field}" unless work.key?(field)
    end

    %w[id title author period type form language source_label source_url].each do |field|
      if work[field].to_s.strip.empty?
        errors << "_data/literature.yml: #{title} #{field} must not be empty"
      end
    end

    if work.key?("polity") || work.key?("author_note")
      errors << "_data/literature.yml: #{title} uses a retired polity or author_note field"
    end

    if work["period"].to_s.match?(/(?:代|时期)\z/)
      errors << "_data/literature.yml: #{title} period must omit 代 and 时期 suffixes"
    end

    unless work["region"].is_a?(String)
      errors << "_data/literature.yml: #{title} region must be a string"
    end

    unless LITERATURE_FORMS.include?(work["form"])
      errors << "_data/literature.yml: #{title} form must be verse or prose"
    end

    unless work["language"].to_s.match?(/\A[a-z]{2,3}\z/)
      errors << "_data/literature.yml: #{title} language must be a lowercase ISO 639 code"
    end

    aliases = work["aliases"]
    unless aliases.is_a?(Array)
      errors << "_data/literature.yml: #{title} aliases must be an array"
    end

    content = work["content"]
    unless content.is_a?(Array) && !content.empty? && content.all? { |line| line.is_a?(String) && !line.strip.empty? }
      errors << "_data/literature.yml: #{title} content must be a non-empty string array"
    end

    translated_content = work["translated_content"]
    unless translated_content.is_a?(Array) && translated_content.all? { |line| line.is_a?(String) && !line.strip.empty? }
      errors << "_data/literature.yml: #{title} translated_content must be a string array"
    end
    if work["language"] == "zh" && translated_content.is_a?(Array) && !translated_content.empty?
      errors << "_data/literature.yml: #{title} must not add a Chinese translation to Chinese source text"
    end

    author = work["author"]
    if author != "佚名" && !person_names.key?(author)
      errors << "_data/literature.yml: #{title} has unmapped author: #{author}"
    end
  end

  duplicate_literature_ids = literature.map { |work| work["id"] }.compact.tally.select { |_id, count| count > 1 }.keys
  unless duplicate_literature_ids.empty?
    errors << "_data/literature.yml: duplicate ids: #{duplicate_literature_ids.join(", ")}"
  end
rescue Psych::SyntaxError => error
  errors << "_data/literature.yml: invalid YAML (#{error.message.lines.first.strip})"
end

if errors.empty?
  puts "Content validation passed for #{Dir.glob(POST_GLOB).size} posts."
  exit 0
end

warn "Content validation failed:"
errors.each { |error| warn "- #{error}" }
exit 1
