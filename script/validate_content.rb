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

  music.each do |track|
    title = track["title"] || "(untitled)"
    primary_genre = track["primary_genre"]

    if track.key?("contexts")
      errors << "_data/music.yml: #{title} contexts has been folded into tags"
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

if errors.empty?
  puts "Content validation passed for #{Dir.glob(POST_GLOB).size} posts."
  exit 0
end

warn "Content validation failed:"
errors.each { |error| warn "- #{error}" }
exit 1
