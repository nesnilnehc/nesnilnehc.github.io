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
  permalink
].freeze
ALLOWED_CATEGORIES = %w[news tech tutorials].freeze
ALLOWED_ARTICLE_TYPES = %w[
  concept
  comparison
  guide
  troubleshooting
  case-study
  digest
  opinion
].freeze
ALLOWED_DIFFICULTIES = %w[beginner intermediate advanced].freeze

errors = []
series_positions = {}

series_data = YAML.safe_load_file("_data/series.yml", aliases: true)
series_ids = Array(series_data).map { |series| series.fetch("id") }

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

  difficulty = data["difficulty"]
  if difficulty && !ALLOWED_DIFFICULTIES.include?(difficulty)
    errors << "#{path}: unknown difficulty #{difficulty.inspect}"
  end

  permalink = data["permalink"].to_s
  unless permalink.start_with?("/") && !permalink.match?(/\s/)
    errors << "#{path}: permalink must be a whitespace-free absolute path"
  end

  next unless data["series"]

  series = data["series"]
  order = data["series_order"]
  errors << "#{path}: unknown series #{series.inspect}" unless series_ids.include?(series)
  errors << "#{path}: series_order must be a positive integer" unless order.is_a?(Integer) && order.positive?

  position = [series, order]
  if series_positions.key?(position)
    errors << "#{path}: duplicates series position #{series} ##{order} with #{series_positions[position]}"
  else
    series_positions[position] = path
  end
end

if errors.empty?
  puts "Content validation passed for #{Dir.glob(POST_GLOB).size} posts."
  exit 0
end

warn "Content validation failed:"
errors.each { |error| warn "- #{error}" }
exit 1
